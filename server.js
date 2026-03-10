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

app.all('/voice', (req, res) => {
    // Check both body (POST) and query (GET)
    const params = Object.keys(req.body).length > 0 ? req.body : req.query;
    console.log('Voice Request Received. Params:', params);

    let destinationNumber = params.To || '';

    const response = new twilio.twiml.VoiceResponse();
    const myTwilioNumber = '+918530483318'; 

    if (destinationNumber && destinationNumber !== '') {
        console.log('Dialing Number:', destinationNumber);
        const dial = response.dial({ callerId: myTwilioNumber });
        dial.number(destinationNumber);
    } else {
        console.log('Destination Number Missing or Empty!');
        response.say("Connection successful, but phone number is missing.");
    }
// ... aapka upar ka dial() wala code ...
    
    // Ye nayi line Twilio ki cache memory ko disable kar degi
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); 
    
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
});
// Cloud server ka port ya fir testing ke liye 3000
const port = process.env.PORT || 3000; 

app.listen(port, () => {
    console.log(`🚀 Server is live and running on port ${port}`);
});