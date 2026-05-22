const SPREADSHEET_ID = "1vtSn7ODdvluhhLYkB_fW6i57Lrw_y0kKtzX9e56HNzU";
const CAL_LINK = "https://cal.com/braveheart/30min";
const LOGO_URL = "";
const REFERRAL_TUTORIAL_URL = "https://braveheartfellowship.org/referrals.html";

const SHEETS = {
  referralCodes: "ReferralCodes",
  applicants: "Applicants",
  interviewees: "Interviewees",
  fellows: "Fellows",
  grantees: "Grantees"
};

const HEADERS = {
  referralCodes: ["code", "active", "issued_by", "notes"],
  applicants: [
    "submitted_at_utc",
    "application_type",
    "name",
    "email",
    "referral_code",
    "work_description",
    "links",
    "proudest_work",
    "status",
    "cal_link_sent_at_utc"
  ],
  interviewees: [
    "booked_at_utc",
    "application_type",
    "name",
    "email",
    "referral_code",
    "cal_booking_id",
    "cal_start_time",
    "status"
  ],
  fellows: ["decided_at_utc", "name", "email", "application_type", "notes"],
  grantees: ["decided_at_utc", "name", "email", "application_type", "notes"]
};

function doPost(e) {
  try {
    const payload = parsePayload(e);

    if (payload.source === "braveheart_application") {
      return handleApplication(payload);
    }

    if (isCalBookingPayload(payload)) {
      return handleCalBooking(payload);
    }

    return jsonResponse({
      ok: false,
      message: "Unknown request payload."
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error && error.message ? error.message : "Unexpected error."
    });
  }
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function handleApplication(payload) {
  const applicationType = cleanValue(payload.application_type);
  const name = cleanValue(payload.name);
  const email = cleanValue(payload.email).toLowerCase();
  const referralCode = cleanValue(payload.referral_code);
  const workDescription = cleanValue(payload.work_description);
  const links = cleanValue(payload.links);
  const proudestWork = cleanValue(payload.proudest_work);

  if (!["fellowship", "grant"].includes(applicationType)) {
    return jsonResponse({
      ok: false,
      message: "Invalid application type."
    });
  }

  if (!name || !isValidEmail(email) || !referralCode || !workDescription || !proudestWork) {
    return jsonResponse({
      ok: false,
      message: "Please complete all required fields with a valid email."
    });
  }

  const spreadsheet = getSpreadsheet();
  ensureBaseSheets(spreadsheet);

  if (!isValidReferralCode(spreadsheet, referralCode)) {
    return jsonResponse({
      ok: false,
      code: "INVALID_REFERRAL",
      message: "Referral code is not valid.",
      referralTutorialUrl: REFERRAL_TUTORIAL_URL
    });
  }

  const applicantsSheet = spreadsheet.getSheetByName(SHEETS.applicants);
  const submittedAt = new Date().toISOString();

  applicantsSheet.appendRow([
    submittedAt,
    applicationType,
    name,
    email,
    referralCode,
    workDescription,
    links,
    proudestWork,
    "cal_link_sent",
    submittedAt
  ]);

  sendCalEmail({
    applicationType,
    name,
    email
  });

  return jsonResponse({
    ok: true,
    application_type: applicationType,
    message: "Application received."
  });
}

function handleCalBooking(payload) {
  const booking = extractCalBooking(payload);

  if (!booking.email) {
    return jsonResponse({
      ok: false,
      message: "Cal booking email not found."
    });
  }

  const spreadsheet = getSpreadsheet();
  ensureBaseSheets(spreadsheet);

  const applicant = findApplicantByEmail(spreadsheet, booking.email);
  const intervieweesSheet = spreadsheet.getSheetByName(SHEETS.interviewees);
  const bookedAt = new Date().toISOString();
  const status = applicant ? "interview_booked" : "unmatched_booking";

  intervieweesSheet.appendRow([
    bookedAt,
    applicant ? applicant.applicationType : "",
    applicant ? applicant.name : booking.name,
    booking.email,
    applicant ? applicant.referralCode : "",
    booking.bookingId,
    booking.startTime,
    status
  ]);

  if (applicant) {
    updateApplicantStatus(spreadsheet, applicant.rowIndex, "interview_booked");
  }

  return jsonResponse({
    ok: true,
    status
  });
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureBaseSheets(spreadsheet) {
  ensureSheet(spreadsheet, SHEETS.referralCodes, HEADERS.referralCodes);
  ensureSheet(spreadsheet, SHEETS.applicants, HEADERS.applicants);
  ensureSheet(spreadsheet, SHEETS.interviewees, HEADERS.interviewees);
  ensureSheet(spreadsheet, SHEETS.fellows, HEADERS.fellows);
  ensureSheet(spreadsheet, SHEETS.grantees, HEADERS.grantees);
}

function ensureSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function isValidReferralCode(spreadsheet, referralCode) {
  const sheet = spreadsheet.getSheetByName(SHEETS.referralCodes);
  const values = sheet.getDataRange().getValues();
  const normalizedCode = referralCode.toLowerCase();

  for (let i = 1; i < values.length; i += 1) {
    const code = cleanValue(values[i][0]).toLowerCase();
    const active = cleanValue(values[i][1]).toLowerCase();

    if (code === normalizedCode && ["true", "yes", "1", "active"].includes(active)) {
      return true;
    }
  }

  return false;
}

function sendCalEmail(applicant) {
  const label = applicant.applicationType === "grant" ? "grant" : "fellowship";
  const logoMarkup = LOGO_URL
    ? `<img src="${LOGO_URL}" alt="Braveheart Fellowship" style="display:block;max-width:160px;margin:0 0 24px;">`
    : "<h1 style=\"margin:0 0 24px;font-size:24px;\">Braveheart Fellowship</h1>";

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;background:#090907;color:#fff8eb;padding:32px;">
      ${logoMarkup}
      <p style="font-size:18px;line-height:1.5;margin:0 0 16px;">Hi ${escapeHtml(applicant.name)},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
        Your referral code was accepted. The next step for the Braveheart ${label} application is a short call.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
        Book a 30-minute slot here:
      </p>
      <p style="margin:0 0 28px;">
        <a href="${CAL_LINK}" style="background:#fff8eb;color:#090907;padding:12px 16px;text-decoration:none;display:inline-block;">Book your call</a>
      </p>
      <p style="font-size:14px;line-height:1.5;color:#d7cfc1;margin:0;">
        Fortune favours the bold.<br>
        Braveheart Fellowship
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: applicant.email,
    subject: "Next step: book your Braveheart call",
    htmlBody,
    body: `Hi ${applicant.name},\n\nYour referral code was accepted. Book your Braveheart ${label} call here:\n${CAL_LINK}\n\nFortune favours the bold.\nBraveheart Fellowship`
  });
}

function isCalBookingPayload(payload) {
  const eventName = cleanValue(payload.triggerEvent || payload.event || payload.type);
  return eventName.indexOf("BOOKING_CREATED") !== -1 || eventName.indexOf("booking.created") !== -1;
}

function extractCalBooking(payload) {
  const data = payload.payload || payload.data || payload;
  const attendee = Array.isArray(data.attendees) ? data.attendees[0] : null;
  const email = cleanValue(
    data.email ||
    data.attendeeEmail ||
    data.bookerEmail ||
    (attendee && attendee.email)
  ).toLowerCase();
  const name = cleanValue(
    data.name ||
    data.attendeeName ||
    data.bookerName ||
    (attendee && attendee.name)
  );

  return {
    email,
    name,
    bookingId: cleanValue(data.uid || data.id || data.bookingId),
    startTime: cleanValue(data.startTime || data.start || data.start_time)
  };
}

function findApplicantByEmail(spreadsheet, email) {
  const sheet = spreadsheet.getSheetByName(SHEETS.applicants);
  const values = sheet.getDataRange().getValues();
  const normalizedEmail = email.toLowerCase();

  for (let i = values.length - 1; i >= 1; i -= 1) {
    if (cleanValue(values[i][3]).toLowerCase() === normalizedEmail) {
      return {
        rowIndex: i + 1,
        applicationType: cleanValue(values[i][1]),
        name: cleanValue(values[i][2]),
        referralCode: cleanValue(values[i][4])
      };
    }
  }

  return null;
}

function updateApplicantStatus(spreadsheet, rowIndex, status) {
  const sheet = spreadsheet.getSheetByName(SHEETS.applicants);
  const statusColumn = HEADERS.applicants.indexOf("status") + 1;
  sheet.getRange(rowIndex, statusColumn).setValue(status);
}

function cleanValue(value) {
  return String(value || "").trim().replace(/[\r\n]+/g, " ");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return cleanValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
