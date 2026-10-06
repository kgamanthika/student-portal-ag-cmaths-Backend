const sendSMS = async (recipient, message) => {
  try {
    let phoneNumber = String(recipient).trim();

    // 0712345678 → 94712345678
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "94" + phoneNumber.substring(1);
    }

    const response = await fetch(
      "https://app.text.lk/api/v3/sms/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          recipient: phoneNumber,
          sender_id: process.env.TEXTLK_SENDER_ID,
          type: "plain",
          message,
        }),
      }
    );

    const result = await response.json();

    // console.log("Text.lk response:", result);

    if (!response.ok || result.status === false) {
      throw new Error(
        result.message || "SMS sending failed"
      );
    }

    return result;

  } catch (error) {
    console.error("SMS Error:", error);
    throw error;
  }
};

module.exports = sendSMS;