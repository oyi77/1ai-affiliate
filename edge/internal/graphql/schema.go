package graphql

import (
	"context"
	"fmt"
	"time"

	"github.com/graphql-go/graphql"
	"github.com/1ai-affiliate/edge/internal/clickhouse"
)

// Schema represents the GraphQL schema for the 1ai-affiliate API.
var Schema graphql.Schema

// NewSchema creates a GraphQL schema backed by the given ClickHouse client.
func NewSchema(ch *clickhouse.Client) (graphql.Schema, error) {
	qt := buildQueryType(ch)
	mt := buildMutationType(ch)
	return graphql.NewSchema(graphql.SchemaConfig{
		Query:    qt,
		Mutation: mt,
	})
}

// --- Types ---

var clickType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Click",
	Fields: graphql.Fields{
		"id":          &graphql.Field{Type: graphql.String},
		"campaignId":  &graphql.Field{Type: graphql.Int},
		"affiliateId": &graphql.Field{Type: graphql.Int},
		"offerId":     &graphql.Field{Type: graphql.Int},
		"ip":          &graphql.Field{Type: graphql.String},
		"country":     &graphql.Field{Type: graphql.String},
		"device":      &graphql.Field{Type: graphql.String},
		"os":          &graphql.Field{Type: graphql.String},
		"browser":     &graphql.Field{Type: graphql.String},
		"timestamp":   &graphql.Field{Type: graphql.DateTime},
		"fraudScore":  &graphql.Field{Type: graphql.Float},
		"targetUrl":   &graphql.Field{Type: graphql.String},
	},
})

var conversionType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Conversion",
	Fields: graphql.Fields{
		"id":           &graphql.Field{Type: graphql.String},
		"clickId":      &graphql.Field{Type: graphql.String},
		"sessionId":    &graphql.Field{Type: graphql.String},
		"affiliateId":  &graphql.Field{Type: graphql.Int},
		"offerId":      &graphql.Field{Type: graphql.Int},
		"payout":       &graphql.Field{Type: graphql.Float},
		"revenue":      &graphql.Field{Type: graphql.Float},
		"status":       &graphql.Field{Type: graphql.String},
		"timestamp":    &graphql.Field{Type: graphql.DateTime},
	},
})

var campaignType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Campaign",
	Fields: graphql.Fields{
		"id":         &graphql.Field{Type: graphql.Int},
		"name":       &graphql.Field{Type: graphql.String},
		"status":     &graphql.Field{Type: graphql.String},
		"token":      &graphql.Field{Type: graphql.String},
		"offerId":    &graphql.Field{Type: graphql.Int},
		"defaultUrl": &graphql.Field{Type: graphql.String},
		"dailyCap":   &graphql.Field{Type: graphql.Int},
		"clicks":     &graphql.Field{Type: graphql.Int},
		"conversions": &graphql.Field{Type: graphql.Int},
		"revenue":    &graphql.Field{Type: graphql.Float},
		"cost":       &graphql.Field{Type: graphql.Float},
		"profit":     &graphql.Field{Type: graphql.Float},
		"roi":        &graphql.Field{Type: graphql.Float},
	},
})

var affiliateType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Affiliate",
	Fields: graphql.Fields{
		"id":     &graphql.Field{Type: graphql.Int},
		"name":   &graphql.Field{Type: graphql.String},
		"code":   &graphql.Field{Type: graphql.String},
		"tier":   &graphql.Field{Type: graphql.String},
		"clicks": &graphql.Field{Type: graphql.Int},
		"conversions": &graphql.Field{Type: graphql.Int},
		"revenue": &graphql.Field{Type: graphql.Float},
		"commission": &graphql.Field{Type: graphql.Float},
	},
})

var analyticsType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Analytics",
	Fields: graphql.Fields{
		"totalClicks":      &graphql.Field{Type: graphql.Int},
		"totalConversions": &graphql.Field{Type: graphql.Int},
		"totalRevenue":     &graphql.Field{Type: graphql.Float},
		"totalCost":        &graphql.Field{Type: graphql.Float},
		"totalProfit":      &graphql.Field{Type: graphql.Float},
		"cr":               &graphql.Field{Type: graphql.Float},
		"epc":              &graphql.Field{Type: graphql.Float},
		"roi":              &graphql.Field{Type: graphql.Float},
		"byCountry":        &graphql.Field{Type: graphql.NewList(analyticsByCountryType)},
		"byDevice":         &graphql.Field{Type: graphql.NewList(analyticsByDeviceType)},
		"byCampaign":       &graphql.Field{Type: graphql.NewList(analyticsByCampaignType)},
	},
})

var analyticsByCountryType = graphql.NewObject(graphql.ObjectConfig{
	Name: "AnalyticsByCountry",
	Fields: graphql.Fields{
		"country":    &graphql.Field{Type: graphql.String},
		"clicks":     &graphql.Field{Type: graphql.Int},
		"conversions": &graphql.Field{Type: graphql.Int},
		"revenue":    &graphql.Field{Type: graphql.Float},
	},
})

var analyticsByDeviceType = graphql.NewObject(graphql.ObjectConfig{
	Name: "AnalyticsByDevice",
	Fields: graphql.Fields{
		"device":     &graphql.Field{Type: graphql.String},
		"clicks":     &graphql.Field{Type: graphql.Int},
		"conversions": &graphql.Field{Type: graphql.Int},
		"revenue":    &graphql.Field{Type: graphql.Float},
	},
})

var analyticsByCampaignType = graphql.NewObject(graphql.ObjectConfig{
	Name: "AnalyticsByCampaign",
	Fields: graphql.Fields{
		"campaignId": &graphql.Field{Type: graphql.Int},
		"campaignName": &graphql.Field{Type: graphql.String},
		"clicks":     &graphql.Field{Type: graphql.Int},
		"conversions": &graphql.Field{Type: graphql.Int},
		"revenue":    &graphql.Field{Type: graphql.Float},
		"cost":       &graphql.Field{Type: graphql.Float},
		"profit":     &graphql.Field{Type: graphql.Float},
	},
})

// --- Query fields ---

func buildQueryType(ch *clickhouse.Client) *graphql.Object {
	return graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"clicks": &graphql.Field{
				Type: graphql.NewList(clickType),
				Args: graphql.FieldConfigArgument{
					"campaignId":  &graphql.ArgumentConfig{Type: graphql.Int},
					"affiliateId": &graphql.ArgumentConfig{Type: graphql.Int},
					"from":        &graphql.ArgumentConfig{Type: graphql.DateTime},
					"to":          &graphql.ArgumentConfig{Type: graphql.DateTime},
					"limit":       &graphql.ArgumentConfig{Type: graphql.Int},
					"offset":      &graphql.ArgumentConfig{Type: graphql.Int},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					var affID *int
					if v, ok := p.Args["affiliateId"].(int); ok { affID = &v }
					var from, to *time.Time
					if v, ok := p.Args["from"].(time.Time); ok { from = &v }
					if v, ok := p.Args["to"].(time.Time); ok { to = &v }
					limit := 100
					if v, ok := p.Args["limit"].(int); ok && v > 0 { limit = v }
					offset := 0
					if v, ok := p.Args["offset"].(int); ok { offset = v }
					return ch.QueryClicks(context.Background(), affID, from, to, limit, offset)
				},
			},
			"conversions": &graphql.Field{
				Type: graphql.NewList(conversionType),
				Args: graphql.FieldConfigArgument{
					"affiliateId": &graphql.ArgumentConfig{Type: graphql.Int},
					"offerId":     &graphql.ArgumentConfig{Type: graphql.Int},
					"from":        &graphql.ArgumentConfig{Type: graphql.DateTime},
					"to":          &graphql.ArgumentConfig{Type: graphql.DateTime},
					"limit":       &graphql.ArgumentConfig{Type: graphql.Int},
					"offset":      &graphql.ArgumentConfig{Type: graphql.Int},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					var affID, offerID *int
					if v, ok := p.Args["affiliateId"].(int); ok { affID = &v }
					if v, ok := p.Args["offerId"].(int); ok { offerID = &v }
					var from, to *time.Time
					if v, ok := p.Args["from"].(time.Time); ok { from = &v }
					if v, ok := p.Args["to"].(time.Time); ok { to = &v }
					limit := 100
					if v, ok := p.Args["limit"].(int); ok && v > 0 { limit = v }
					offset := 0
					if v, ok := p.Args["offset"].(int); ok { offset = v }
					return ch.QueryConversions(context.Background(), affID, offerID, from, to, limit, offset)
				},
			},
			"analytics": &graphql.Field{
				Type: analyticsType,
				Args: graphql.FieldConfigArgument{
					"from":        &graphql.ArgumentConfig{Type: graphql.DateTime},
					"to":          &graphql.ArgumentConfig{Type: graphql.DateTime},
					"campaignId":  &graphql.ArgumentConfig{Type: graphql.Int},
					"affiliateId": &graphql.ArgumentConfig{Type: graphql.Int},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					var campID, affID *int
					if v, ok := p.Args["campaignId"].(int); ok { campID = &v }
					if v, ok := p.Args["affiliateId"].(int); ok { affID = &v }
					var from, to *time.Time
					if v, ok := p.Args["from"].(time.Time); ok { from = &v }
					if v, ok := p.Args["to"].(time.Time); ok { to = &v }
					return ch.QueryAnalytics(context.Background(), from, to, campID, affID)
				},
			},
		},
	})
}

// --- Mutation fields ---

func buildMutationType(ch *clickhouse.Client) *graphql.Object {
	return graphql.NewObject(graphql.ObjectConfig{
		Name: "Mutation",
		Fields: graphql.Fields{
			// Mutations are handled by the Node API, not the Go edge.
			// These stubs return an error directing callers to the REST API.
			"createCampaign": &graphql.Field{
				Type: campaignType,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					return nil, fmt.Errorf("use POST /api/admin/campaigns instead")
				},
			},
			"updateCampaign": &graphql.Field{
				Type: campaignType,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					return nil, fmt.Errorf("use PATCH /api/admin/campaigns/:id instead")
				},
			},
			"scheduleExport": &graphql.Field{
				Type: graphql.String,
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					return nil, fmt.Errorf("use POST /api/enterprise/scheduled-exports instead")
				},
			},
		},
	})
}
