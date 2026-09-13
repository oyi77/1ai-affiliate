'use strict';
/**
 * Admin controller — barrel preserving the exact public surface.
 * Handler bodies live per-domain in ./adminUsers|adminFinance|adminOffers|adminDomains|adminReports.js
 * (+ shared helpers in ./adminShared.js). Split under the 800-line gate; zero behavior change.
 */

const shared = require('./adminShared');
const users = require('./adminUsers');
const finance = require('./adminFinance');
const offers = require('./adminOffers');
const domains = require('./adminDomains');
const reports = require('./adminReports');

module.exports = {
  toNumber: shared.toNumber,
  queryRows: shared.queryRows,
  queryOne: shared.queryOne,
  getUsers: users.getUsers,
  createUser: users.createUser,
  getAffiliates: users.getAffiliates,
  getEarnings: finance.getEarnings,
  approveEarning: finance.approveEarning,
  getStats: finance.getStats,
  getCommissions: finance.getCommissions,
  getPayments: finance.getPayments,
  getCampaigns: offers.getCampaigns,
  getReport: offers.getReport,
  exportReportCsv: offers.exportReportCsv,
  getSystemStatus: reports.getSystemStatus,
  getClickServers: reports.getClickServers,
  addClickServer: reports.addClickServer,
  getVipProfile: users.getVipProfile,
  saveVipProfile: users.saveVipProfile,
  getOffers: offers.getOffers,
  createOffer: offers.createOffer,
  linkOfferToCampaign: offers.linkOfferToCampaign,
  getMargin: finance.getMargin,
  setMargin: finance.setMargin,
  getNetworks: offers.getNetworks,
  createNetwork: offers.createNetwork,
  setOfferPostback: domains.setOfferPostback,
  getOfferPostback: domains.getOfferPostback,
  getPostbackLogs: domains.getPostbackLogs,
  getDomains: domains.getDomains,
  createDomain: domains.createDomain,
  updateDomain: domains.updateDomain,
  deleteDomain: domains.deleteDomain,
  getShortenerServices: domains.getShortenerServices,
  saveShortenerService: domains.saveShortenerService,
  deleteShortenerService: domains.deleteShortenerService,
  testShortenerService: domains.testShortenerService,
  shortenUrl: domains.shortenUrl,
};
