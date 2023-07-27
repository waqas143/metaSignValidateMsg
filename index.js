const express = require("express");
var bodyParser = require("body-parser");

// Used to perfrom signature authentication
var ethUtil = require("ethereumjs-util");

const PORT = 3001;
const cors = require("cors");
// const path = require('path');

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());
app.use(cors());

const isValidSignature = async (req, res) => {
  try {
    const { signingAddress, signature, messageToSign } = req.query;

    if (
      !signingAddress ||
      typeof signingAddress !== "string" ||
      !signature ||
      !messageToSign
    ) {
      return res.send({ error: "server_error", desc: "missing values" });
    }

    const msg = messageToSign;
    // Convert msg to hex string
    const msgHex = ethUtil.bufferToHex(Buffer.from(msg));

    // Check if signature is valid
    const msgBuffer = ethUtil.toBuffer(msgHex);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addresBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addresBuffer);

    return res.send({
      isValid: signingAddress.toLowerCase() === address.toLowerCase(),
      error: null,
    });
  } catch (error) {
    console.log(error);
    return res.send({ error: "server_error", desc: error });
  }
};

app.get("/isValidSignature", isValidSignature);

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
