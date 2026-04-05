(function () {
  const templates = window.ussdTemplates;

  function pickFacility(service, zone) {
    const matches = templates.facilities.filter((facility) => {
      const serviceMatch = facility.service === service || service === "general";
      const zoneMatch = facility.zone === zone || zone === "central";
      return serviceMatch && zoneMatch;
    });

    return matches[0] || templates.facilities[0];
  }

  function triageRecommendation(data) {
    if (data.triageSeverity === "3" || data.triageSymptom === "3") {
      return {
        urgency: "Emergency",
        nextStep: "Go to urgent physical care now.",
        service: "urgent"
      };
    }

    if (data.triageSeverity === "2") {
      return {
        urgency: "Same day review",
        nextStep: "Seek a clinician today or use telemedicine first.",
        service: data.triageSymptom === "4" ? "maternity" : data.triageSymptom === "5" ? "pediatrics" : "general"
      };
    }

    return {
      urgency: "Home care + telemedicine",
      nextStep: "Use first aid guidance and monitor symptoms closely.",
      service: "general"
    };
  }

  function createUssdSession() {
    const data = {
      triageSymptom: null,
      triageSeverity: null,
      lastMatch: null,
      appointmentSlot: null,
      telemedicine: null,
      alerts: [...templates.alerts]
    };

    const history = [];
    let current = "main";

    const nodes = {
      main: {
        state: "CON",
        render() {
          return [
            "Welcome to CarePath",
            "1. Symptom triage",
            "2. Find facility",
            "3. Book appointment",
            "4. Telemedicine",
            "5. My alerts",
            "0. Exit"
          ].join("\n");
        },
        handle(input) {
          const map = {
            "1": "triageSymptom",
            "2": "facilityService",
            "3": "appointmentService",
            "4": "telemedicineMode",
            "5": "alerts",
            "0": "exit"
          };

          return map[input] || null;
        }
      },
      triageSymptom: {
        state: "CON",
        render() {
          return [
            "Symptom type",
            "1. Fever or flu",
            "2. Injury or accident",
            "3. Breathing problem",
            "4. Pregnancy concern",
            "5. Child illness"
          ].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3", "4", "5"].includes(input)) return null;
          data.triageSymptom = input;
          return "triageSeverity";
        }
      },
      triageSeverity: {
        state: "CON",
        render() {
          return ["Severity", "1. Mild", "2. Moderate", "3. Severe"].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3"].includes(input)) return null;
          data.triageSeverity = input;
          const triage = triageRecommendation(data);
          data.lastMatch = pickFacility(triage.service, "central");
          data.alerts.unshift(`Triage complete: ${triage.urgency}. ${data.lastMatch.name} suggested.`);
          return "triageResult";
        }
      },
      triageResult: {
        state: "CON",
        render() {
          const triage = triageRecommendation(data);
          return [
            `Urgency: ${triage.urgency}`,
            triage.nextStep,
            `Match: ${data.lastMatch.name}`,
            "1. Main menu",
            "2. Book appointment",
            "0. Exit"
          ].join("\n");
        },
        handle(input) {
          if (input === "1") return "main";
          if (input === "2") return "appointmentSlot";
          if (input === "0") return "exit";
          return null;
        }
      },
      facilityService: {
        state: "CON",
        render() {
          return ["Service needed", "1. General care", "2. Urgent care", "3. Maternity", "4. Pediatrics"].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3", "4"].includes(input)) return null;
          data.requestedService = { "1": "general", "2": "urgent", "3": "maternity", "4": "pediatrics" }[input];
          return "facilityZone";
        }
      },
      facilityZone: {
        state: "CON",
        render() {
          return ["Location zone", "1. Central", "2. East", "3. West", "4. Rural"].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3", "4"].includes(input)) return null;
          const zone = { "1": "central", "2": "east", "3": "west", "4": "rural" }[input];
          data.lastMatch = pickFacility(data.requestedService, zone);
          data.alerts.unshift(`Facility match ready: ${data.lastMatch.name}.`);
          return "facilityResult";
        }
      },
      facilityResult: {
        state: "CON",
        render() {
          return [
            `Best match: ${data.lastMatch.name}`,
            `Wait: ${data.lastMatch.wait}`,
            `Distance: ${data.lastMatch.distance}`,
            "1. Book appointment",
            "2. Main menu",
            "0. Exit"
          ].join("\n");
        },
        handle(input) {
          if (input === "1") return "appointmentSlot";
          if (input === "2") return "main";
          if (input === "0") return "exit";
          return null;
        }
      },
      appointmentService: {
        state: "CON",
        render() {
          return ["Book appointment for", "1. General care", "2. Urgent care", "3. Maternity", "4. Pediatrics"].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3", "4"].includes(input)) return null;
          const service = { "1": "general", "2": "urgent", "3": "maternity", "4": "pediatrics" }[input];
          data.lastMatch = pickFacility(service, "central");
          return "appointmentSlot";
        }
      },
      appointmentSlot: {
        state: "CON",
        render() {
          return [
            `Book at ${data.lastMatch ? data.lastMatch.name : templates.facilities[0].name}`,
            `1. ${templates.slots[0]}`,
            `2. ${templates.slots[1]}`,
            `3. ${templates.slots[2]}`
          ].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3"].includes(input)) return null;
          data.appointmentSlot = templates.slots[Number(input) - 1];
          data.alerts.unshift(`Appointment reserved at ${data.lastMatch.name} for ${data.appointmentSlot}.`);
          return "appointmentResult";
        }
      },
      appointmentResult: {
        state: "CON",
        render() {
          return [
            "Appointment booked",
            `${data.lastMatch.name}`,
            `${data.appointmentSlot}`,
            "1. Main menu",
            "0. Exit"
          ].join("\n");
        },
        handle(input) {
          if (input === "1") return "main";
          if (input === "0") return "exit";
          return null;
        }
      },
      telemedicineMode: {
        state: "CON",
        render() {
          return ["Telemedicine mode", "1. Chat", "2. Audio", "3. Video"].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3"].includes(input)) return null;
          data.telemedicineMode = input;
          return "telemedicineReason";
        }
      },
      telemedicineReason: {
        state: "CON",
        render() {
          return ["Reason", "1. Follow-up", "2. General symptoms", "3. Medication question", "4. Child health"].join("\n");
        },
        handle(input) {
          if (!["1", "2", "3", "4"].includes(input)) return null;
          const reasons = {
            "1": "Follow-up review",
            "2": "General symptoms",
            "3": "Medication guidance",
            "4": "Child health concern"
          };
          data.telemedicine = {
            mode: templates.telemedicineModes[data.telemedicineMode],
            reason: reasons[input],
            eta: data.telemedicineMode === "3" ? "12 minutes" : "6 minutes"
          };
          data.alerts.unshift(`Telemedicine queued: ${data.telemedicine.mode} in ${data.telemedicine.eta}.`);
          return "telemedicineResult";
        }
      },
      telemedicineResult: {
        state: "CON",
        render() {
          return [
            `${data.telemedicine.mode}`,
            `${data.telemedicine.reason}`,
            `ETA: ${data.telemedicine.eta}`,
            "1. Main menu",
            "0. Exit"
          ].join("\n");
        },
        handle(input) {
          if (input === "1") return "main";
          if (input === "0") return "exit";
          return null;
        }
      },
      alerts: {
        state: "CON",
        render() {
          const items = data.alerts.slice(0, 3).map((alert, index) => `${index + 1}. ${alert}`);
          return [...items, "9. Main menu", "0. Exit"].join("\n");
        },
        handle(input) {
          if (input === "9") return "main";
          if (input === "0") return "exit";
          return null;
        }
      },
      exit: {
        state: "END",
        render() {
          return "Thank you for using CarePath.";
        },
        handle() {
          return null;
        }
      }
    };

    function navigate(next) {
      if (!next || next === current) return;
      history.push(current);
      current = next;
    }

    return {
      getScreen() {
        return {
          state: nodes[current].state,
          text: nodes[current].render(),
          canGoBack: history.length > 0 && current !== "main",
          context: { ...data }
        };
      },
      submit(input) {
        const next = nodes[current].handle(input);
        if (!next) return false;
        navigate(next);
        return true;
      },
      back() {
        if (!history.length) return;
        current = history.pop();
      },
      restart() {
        history.length = 0;
        current = "main";
        data.triageSymptom = null;
        data.triageSeverity = null;
        data.lastMatch = null;
        data.appointmentSlot = null;
        data.telemedicine = null;
        data.alerts = [...templates.alerts];
      }
    };
  }

  window.createUssdSession = createUssdSession;
})();
