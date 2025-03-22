const fast2sms = require('fast-two-sms')

var options = {authorization : YOUR_API_KEY , message : 'YOUR_MESSAGE_HERE' ,  numbers : ['9999999999','8888888888']} 
fast2sms.sendMessage(options) 