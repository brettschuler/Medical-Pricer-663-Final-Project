'use strict';

const Provider = require("./provider");

class Headers extends Provider
{
	constructor()
	{
		super();

		this.data = ["HTTP_USER_AGENT","HTTP_X_OPERAMINI_PHONE_UA","HTTP_X_DEVICE_USER_AGENT","HTTP_X_ORIGINAL_USER_AGENT","HTTP_X_SKYFIRE_PHONE","HTTP_X_BOLT_PHONE_UA","HTTP_DEVICE_STOCK_UA","HTTP_X_UCBROWSER_DEVICE_UA","HTTP_FROM","HTTP_X_SCANNER"];
	}
}

module.exports = Headers;