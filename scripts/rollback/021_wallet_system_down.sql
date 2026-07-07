-- Rollback for 021_wallet_system.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

DROP TABLE IF EXISTS 1ai_boost_orders;
DROP TABLE IF EXISTS 1ai_exchange_rates;
DROP TABLE IF EXISTS 1ai_feature_pricing;
DROP TABLE IF EXISTS 1ai_wallet_spending;
