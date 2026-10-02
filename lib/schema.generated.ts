// generated from the Odoo module state-transition matrices (otm.*)
export type Schema = Record<string, {stateField:string; states:Record<string,string>; reason:string[]; actions:Record<string,{from:string[]; system:boolean}>}>;
export const SCHEMA: Schema = {
 "otm.client.integration": {
  "stateField": "status",
  "states": {
   "active": "Active",
   "expiring": "Expiring",
   "expired": "Expired",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_cancel"
  ],
  "actions": {
   "action_renew": {
    "from": [
     "active",
     "expiring",
     "expired"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "active",
     "expiring",
     "expired"
    ],
    "system": false
   }
  }
 },
 "otm.customer.agreement": {
  "stateField": "status",
  "states": {
   "draft": "Draft",
   "generated": "Generated",
   "sent": "Sent",
   "customer_accepted": "Customer Accepted",
   "signed": "Signed",
   "completed": "Completed",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_cancel"
  ],
  "actions": {
   "action_generate": {
    "from": [
     "draft"
    ],
    "system": false
   },
   "action_send": {
    "from": [
     "generated"
    ],
    "system": false
   },
   "action_accept": {
    "from": [
     "sent"
    ],
    "system": false
   },
   "action_sign": {
    "from": [
     "customer_accepted"
    ],
    "system": false
   },
   "action_complete": {
    "from": [
     "signed"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "draft",
     "generated",
     "sent",
     "customer_accepted",
     "signed"
    ],
    "system": false
   }
  }
 },
 "otm.qc": {
  "stateField": "status",
  "states": {
   "pending": "Pending",
   "testing": "Testing",
   "passed": "Passed",
   "failed": "Failed"
  },
  "reason": [],
  "actions": {
   "action_start": {
    "from": [
     "pending"
    ],
    "system": false
   },
   "action_pass": {
    "from": [
     "testing"
    ],
    "system": false
   },
   "action_fail": {
    "from": [
     "testing"
    ],
    "system": false
   }
  }
 },
 "otm.qc.issue": {
  "stateField": "status",
  "states": {
   "open": "Open",
   "assigned": "Assigned",
   "fixed": "Fixed",
   "retest": "Retest",
   "passed": "Passed",
   "rejected": "Rejected"
  },
  "reason": [
   "action_fail",
   "action_reject"
  ],
  "actions": {
   "action_assign": {
    "from": [
     "open"
    ],
    "system": false
   },
   "action_fix": {
    "from": [
     "assigned"
    ],
    "system": false
   },
   "action_pass": {
    "from": [
     "retest"
    ],
    "system": false
   },
   "action_fail": {
    "from": [
     "retest"
    ],
    "system": false
   },
   "action_reject": {
    "from": [
     "open",
     "assigned"
    ],
    "system": false
   }
  }
 },
 "otm.customer.review": {
  "stateField": "status",
  "states": {
   "requested": "Requested",
   "submitted": "Submitted"
  },
  "reason": [],
  "actions": {
   "action_submit": {
    "from": [
     "requested"
    ],
    "system": false
   }
  }
 },
 "otm.project.stage.line": {
  "stateField": "state",
  "states": {
   "pending": "Pending",
   "in_progress": "In Progress",
   "done": "Done",
   "skipped": "Skipped"
  },
  "reason": [
   "action_skip",
   "action_reopen"
  ],
  "actions": {
   "action_start": {
    "from": [
     "pending"
    ],
    "system": false
   },
   "action_complete": {
    "from": [
     "in_progress"
    ],
    "system": false
   },
   "action_skip": {
    "from": [
     "pending"
    ],
    "system": false
   },
   "action_reopen": {
    "from": [
     "done",
     "skipped"
    ],
    "system": false
   }
  }
 },
 "otm.client.service": {
  "stateField": "status",
  "states": {
   "active": "Active",
   "expiring": "Expiring",
   "expired": "Expired",
   "renewed": "Renewed",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_cancel"
  ],
  "actions": {
   "action_cancel": {
    "from": [
     "active",
     "renewed",
     "expiring",
     "expired"
    ],
    "system": false
   }
  }
 },
 "otm.service.renewal": {
  "stateField": "status",
  "states": {
   "follow_up": "Sales Follow-up",
   "estimate_sent": "Renewal Estimate Sent",
   "approved": "Customer Approved",
   "paid": "Payment Received",
   "completed": "Renewed",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_cancel"
  ],
  "actions": {
   "action_send_estimate": {
    "from": [
     "follow_up"
    ],
    "system": false
   },
   "action_approve": {
    "from": [
     "estimate_sent"
    ],
    "system": false
   },
   "action_confirm_payment": {
    "from": [
     "approved"
    ],
    "system": false
   },
   "action_renew": {
    "from": [
     "paid"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "follow_up",
     "estimate_sent",
     "approved"
    ],
    "system": false
   }
  }
 },
 "otm.estimate": {
  "stateField": "status",
  "states": {
   "draft": "Draft",
   "internal_review": "Internal Review",
   "sent": "Sent",
   "negotiation": "Negotiation",
   "approved": "Approved",
   "rejected": "Rejected",
   "expired": "Expired"
  },
  "reason": [
   "action_reject",
   "action_revise",
   "action_reject_discount",
   "action_reset_draft",
   "action_lock_deal"
  ],
  "actions": {
   "action_submit": {
    "from": [
     "draft"
    ],
    "system": false
   },
   "action_reset_draft": {
    "from": [
     "internal_review"
    ],
    "system": false
   },
   "action_send": {
    "from": [
     "internal_review"
    ],
    "system": false
   },
   "action_negotiate": {
    "from": [
     "sent"
    ],
    "system": false
   },
   "action_approve": {
    "from": [
     "sent",
     "negotiation"
    ],
    "system": false
   },
   "action_reject": {
    "from": [
     "internal_review",
     "sent",
     "negotiation"
    ],
    "system": false
   },
   "action_revise": {
    "from": [
     "approved",
     "sent",
     "negotiation",
     "rejected",
     "expired"
    ],
    "system": false
   },
   "action_request_discount": {
    "from": [
     "not_requested",
     "rejected"
    ],
    "system": false
   },
   "action_approve_discount": {
    "from": [
     "pending"
    ],
    "system": false
   },
   "action_reject_discount": {
    "from": [
     "pending"
    ],
    "system": false
   }
  }
 },
 "otm.training": {
  "stateField": "status",
  "states": {
   "scheduled": "Scheduled",
   "in_progress": "In Progress",
   "completed": "Completed",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_cancel"
  ],
  "actions": {
   "action_start": {
    "from": [
     "scheduled"
    ],
    "system": false
   },
   "action_complete": {
    "from": [
     "in_progress"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "scheduled",
     "in_progress"
    ],
    "system": false
   }
  }
 },
 "otm.deal": {
  "stateField": "status",
  "states": {
   "draft": "Draft",
   "locked": "Locked",
   "revision": "In Revision",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_revise",
   "action_cancel"
  ],
  "actions": {
   "action_revise": {
    "from": [
     "locked"
    ],
    "system": false
   },
   "action_relock": {
    "from": [
     "revision"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "locked",
     "revision"
    ],
    "system": false
   }
  }
 },
 "otm.demo": {
  "stateField": "status",
  "states": {
   "scheduled": "Scheduled",
   "confirmed": "Confirmed",
   "completed": "Completed",
   "cancelled": "Cancelled",
   "no_show": "No Show"
  },
  "reason": [
   "action_cancel",
   "action_no_show"
  ],
  "actions": {
   "action_confirm": {
    "from": [
     "scheduled"
    ],
    "system": false
   },
   "action_complete": {
    "from": [
     "confirmed"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "scheduled",
     "confirmed"
    ],
    "system": false
   },
   "action_no_show": {
    "from": [
     "scheduled",
     "confirmed"
    ],
    "system": false
   }
  }
 },
 "otm.deployment": {
  "stateField": "status",
  "states": {
   "pending": "Pending",
   "approved": "Approved",
   "deployed": "Deployed",
   "verification": "Customer Verification",
   "completed": "Completed",
   "issue": "Customer Issue",
   "rollback": "Rolled Back"
  },
  "reason": [
   "action_report_issue",
   "action_rollback"
  ],
  "actions": {
   "action_approve": {
    "from": [
     "pending"
    ],
    "system": false
   },
   "action_deploy": {
    "from": [
     "approved"
    ],
    "system": false
   },
   "action_verify": {
    "from": [
     "deployed"
    ],
    "system": false
   },
   "action_complete": {
    "from": [
     "verification"
    ],
    "system": false
   },
   "action_report_issue": {
    "from": [
     "verification"
    ],
    "system": false
   },
   "action_rollback": {
    "from": [
     "deployed",
     "verification"
    ],
    "system": false
   }
  }
 },
 "project.project": {
  "stateField": "otm_state",
  "states": {
   "planning": "Planning",
   "in_progress": "In Progress",
   "on_hold": "On Hold",
   "delivered": "Delivered",
   "closed": "Closed",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_hold",
   "action_cancel"
  ],
  "actions": {
   "action_otm_start": {
    "from": [
     "planning"
    ],
    "system": false
   },
   "action_final_delivery": {
    "from": [
     "in_progress"
    ],
    "system": false
   },
   "action_close": {
    "from": [
     "delivered"
    ],
    "system": false
   },
   "action_hold": {
    "from": [
     "in_progress"
    ],
    "system": false
   },
   "action_otm_resume": {
    "from": [
     "on_hold"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "planning",
     "in_progress",
     "on_hold"
    ],
    "system": false
   }
  }
 },
 "otm.lead": {
  "stateField": "stage",
  "states": {
   "new": "New",
   "contacted": "Contacted",
   "requirement": "Requirement",
   "demo": "Demo",
   "estimate": "Estimate",
   "negotiation": "Negotiation",
   "deal_locked": "Deal Locked",
   "agreement": "Agreement",
   "advance_pending": "Advance Pending",
   "project": "Project",
   "won": "Won",
   "lost": "Lost"
  },
  "reason": [],
  "actions": {
   "action_contact": {
    "from": [
     "new"
    ],
    "system": false
   },
   "action_collect_requirement": {
    "from": [
     "contacted"
    ],
    "system": false
   },
   "action_demo": {
    "from": [
     "requirement"
    ],
    "system": false
   },
   "action_estimate": {
    "from": [
     "demo"
    ],
    "system": false
   },
   "action_negotiate": {
    "from": [
     "estimate"
    ],
    "system": false
   },
   "action_mark_lost": {
    "from": [
     "new",
     "contacted",
     "requirement",
     "demo",
     "estimate",
     "negotiation",
     "deal_locked",
     "agreement",
     "advance_pending"
    ],
    "system": false
   },
   "action_reopen": {
    "from": [
     "lost"
    ],
    "system": false
   }
  }
 },
 "otm.sales.commission": {
  "stateField": "status",
  "states": {
   "pending": "Pending",
   "earned": "Earned",
   "approved": "Approved",
   "paid": "Paid",
   "cancelled": "Cancelled",
   "reversed": "Reversed"
  },
  "reason": [
   "action_earn",
   "action_cancel",
   "action_reverse"
  ],
  "actions": {
   "action_earn": {
    "from": [
     "pending"
    ],
    "system": false
   },
   "action_approve": {
    "from": [
     "earned"
    ],
    "system": false
   },
   "action_pay": {
    "from": [
     "approved"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "pending",
     "earned"
    ],
    "system": false
   },
   "action_reverse": {
    "from": [
     "approved",
     "paid"
    ],
    "system": false
   }
  }
 },
 "otm.deal.payment": {
  "stateField": "status",
  "states": {
   "pending": "Not Due Yet",
   "due": "Due",
   "requested": "Requested",
   "received": "Received",
   "cancelled": "Cancelled"
  },
  "reason": [
   "action_cancel"
  ],
  "actions": {
   "action_request": {
    "from": [
     "due"
    ],
    "system": false
   },
   "action_confirm": {
    "from": [
     "due",
     "requested"
    ],
    "system": false
   },
   "action_cancel": {
    "from": [
     "pending",
     "due",
     "requested"
    ],
    "system": false
   }
  }
 },
 "project.task": {
  "stateField": "otm_dev_status",
  "states": {
   "not_started": "Not Started",
   "in_progress": "In Progress",
   "submitted": "Submitted",
   "completed": "Completed"
  },
  "reason": [
   "action_return",
   "action_reopen"
  ],
  "actions": {
   "action_otm_start": {
    "from": [
     "not_started"
    ],
    "system": false
   },
   "action_otm_submit": {
    "from": [
     "in_progress"
    ],
    "system": false
   },
   "action_return": {
    "from": [
     "submitted"
    ],
    "system": false
   },
   "action_otm_complete": {
    "from": [
     "submitted"
    ],
    "system": false
   },
   "action_reopen": {
    "from": [
     "completed"
    ],
    "system": false
   }
  }
 }
};
