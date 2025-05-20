const express=require("express");
const session=require("express-session");
const sharedSession = require("socket.io-express-session");
const svgCaptcha=require("svg-captcha");
const bcrypt=require('bcrypt');
const mongodb=require("mongodb").MongoClient;
const {MongoNetworkError,MongoServerSelectionError} = require("mongodb");
const fs=require("fs");
const bodyParser=require("body-parser");
const {Server} = require('socket.io');
module.exports = {
	express,
	session,
	svgCaptcha,
	bcrypt,
	mongodb,
	MongoNetworkError,
	MongoServerSelectionError,
	fs,
	bodyParser,
	Server,
	sharedSession
};