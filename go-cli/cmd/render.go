package cmd

import "p1ai/internal/output"

func render(data []byte) {
	if csvOutput {
		output.RenderCSV(data)
		return
	}
	output.Render(data, jsonOutput)
}
