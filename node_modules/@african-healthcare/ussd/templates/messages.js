window.ussdTemplates = {
  facilities: [
    { id: "f1", name: "Nairobi West Urgent Care", zone: "central", service: "urgent", wait: "18 min", distance: "8 min" },
    { id: "f2", name: "Eastlands Community Clinic", zone: "east", service: "general", wait: "20 min", distance: "11 min" },
    { id: "f3", name: "Karen Family Hospital", zone: "west", service: "maternity", wait: "32 min", distance: "14 min" },
    { id: "f4", name: "Rural Outreach Centre", zone: "rural", service: "general", wait: "28 min", distance: "25 min" },
    { id: "f5", name: "Metro Pediatrics Hub", zone: "central", service: "pediatrics", wait: "16 min", distance: "10 min" }
  ],
  alerts: [
    "Clinic reminder: bring any prescriptions to your visit.",
    "Telemedicine is available for non-emergency reviews today.",
    "Cost estimates can be checked before confirming an appointment."
  ],
  slots: ["08:30 AM", "10:00 AM", "01:30 PM"],
  telemedicineModes: {
    "1": "Chat consultation",
    "2": "Audio consultation",
    "3": "Video consultation"
  }
};
