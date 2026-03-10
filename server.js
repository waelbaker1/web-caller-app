const express = require('express');
const twilio = require('twilio');
const path = require('path');

const app = express();
// Netlify ko server se baat karne ki permission
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// --- Replace these with your actual Twilio details ---
const accountSid = 'AC1cbf0968344dfeca8788515897de39f8'; 
const twilioNumber = '+918530483318'; 
const apiKey = 'SKafc1f5a2b0eca8bd56f53fcbdfdfd0d9';
const apiSecret = 'paKIh0HarKynlnbd0shTVOZF9jr9lFs2';
const twimlAppSid = 'AP5bfa6ff103e47584b79cfee136bf4251';
// 1. Give the browser a token to access Twilio's network
app.get('/token', (req, res) => {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true, 
    });

    // We create a temporary token for the browser
    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity: 'browser_user' });
    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt() });
});

app.post('/voice', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Put your newly verified personal number here (with the +91 country code)
    const dial = twiml.dial({
        callerId: '+918530483318' 
    });
    
    dial.number(req.body.To);
    
    res.type('text/xml');
    res.send(twiml.toString());
});
// Cloud server ka port ya fir testing ke liye 3000
const port = process.env.PORT || 3000; 

app.listen(port, () => {
    console.log(`🚀 Server is live and running on port ${port}`);
});