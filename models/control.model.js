const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ControlSchema = mongoose.Schema({
  user_prefix: { type: String, default: "USR" },
  user_counter: { type: Number, default: 0 },

  verification_prefix: { type: String, default: "VRF" },
  verification_counter: { type: Number, default: 0 },

  lead_prefix: { type: String, default: "LD" },
  lead_counter: { type: Number, default: 0 },

  report_prefix: { type: String, default: "RPT" },
  report_counter: { type: Number, default: 0 },

  employee_prefix: { type: String, default: "EMP" },
  employee_counter: { type: Number, default: 0 },

  invoice_prefix: { type: String, default: "INV" },
  invoice_counter: { type: Number, default: 0 },

  billing_TandC: { type: String, default: "" },
});

module.exports = mongoose.model("Control", ControlSchema);
