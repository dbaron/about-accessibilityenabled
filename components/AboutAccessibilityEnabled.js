// vim: set sw=4 noet ts=4 autoindent copyindent:
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is about:accessibilityenabled.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   L. David Baron <dbaron@dbaron.org> (original author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const CI = Components.interfaces;
const CC = Components.classes;
const CR = Components.results;

const ABOUT_ACCESSIBILITYENABLED_CONTRACTID =
	"@mozilla.org/network/protocol/about;1?what=accessibilityenabled";
const ABOUT_ACCESSIBILITYENABLED_CID =
	Components.ID("{003080df-a8aa-421d-9180-00479e96bfdb}");
const NS_STRINGINPUTSTREAM_CONTRACTID =
	"@mozilla.org/io/string-input-stream;1";
const NS_INPUTSTREAMCHANNEL_CONTRACTID =
	"@mozilla.org/network/input-stream-channel;1";

var AboutAccessibilityEnabledService = {
	// nsISupports implementation

	QueryInterface: function(uuid) {
		if (uuid.equals(CI.nsISupports) || uuid.equals(CI.nsIAboutModule))
			return this;
		throw CR.NS_NOINTERFACE;
	},

	// nsIAboutModule implementation

	newChannel: function(aURI) {
		var x =
			<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
				<head>
					<title>about:accessibilityenabled</title>
				</head>
				<body>
					<p>Firefox currently {
						this.isAccessibilityEnabled()
							? <><strong>does</strong></>
							: <>does <strong>not</strong></>
					} have accessibility API support active.</p>
				</body>
			</html>
		var s = x.toString();

		var is = CC[NS_STRINGINPUTSTREAM_CONTRACTID]
		    .createInstance(CI.nsIStringInputStream);
		is.setData(s, s.length);
		is = is.QueryInterface(CI.nsIInputStream);
		
		var channel = CC[NS_INPUTSTREAMCHANNEL_CONTRACTID]
		    .createInstance(CI.nsIInputStreamChannel);
		channel.setURI(aURI);
		channel.contentStream = is;
		channel = channel.QueryInterface(CI.nsIChannel);
		channel.contentType = "application/xhtml+xml";
		channel.contentCharset = "UTF-8";
		return channel;
	},

	getURIFlags: function(aURI) {
	        return CI.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT;
	},

	// private methods

	isAccessibilityEnabled: function() {
		// Thanks to aaronl’s comment in
		// https://bugzilla.mozilla.org/show_bug.cgi?id=331120#c4
		var enabled;
		try {
			enabled = Components.manager.QueryInterface(CI.nsIServiceManager)
				.isServiceInstantiatedByContractID(
					"@mozilla.org/accessibilityService;1",
					CI.nsISupports);
		} catch (ex) {
			enabled = false;
		}
		return enabled;
	}
};

function ServiceFactory(aObject) {
	this._mObject = aObject;
}

ServiceFactory.prototype = {
	// nsISupports implementation

	QueryInterface: function(uuid) {
		if (uuid.equals(CI.nsISupports) || uuid.equals(CI.nsIFactory))
			return this;
		throw CR.NS_NOINTERFACE;
	},

	// nsIFactory implementation

	createInstance: function(aOuter, iid) {
		if (aOuter)
			throw CR.NS_ERROR_NO_AGGREGATION;
		return this._mObject.QueryInterface(iid);
	},

	lockFactory: function(lock) {
	},

	// private data
	_mObject: null
};

var AboutAccessibilityEnabledModule = {
	// nsISupports implementation

	QueryInterface: function(uuid) {
		if (uuid.equals(CI.nsISupports) || uuid.equals(CI.nsIModule))
			return this;
		throw CR.NS_NOINTERFACE;
	},

	// nsIModule implementation

	getClassObject: function(aCompMgr, aClass, aIID) {
		if (aClass.equals(ABOUT_ACCESSIBILITYENABLED_CID))
			return new ServiceFactory(AboutAccessibilityEnabledService);
		throw CR.NS_ERROR_FACTORY_NOT_REGISTERED;
	},

	registerSelf: function(aCompMgr, aLocation, aLoaderStr, aType) {
		var compReg = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
		compReg.registerFactoryLocation(ABOUT_ACCESSIBILITYENABLED_CID,
		                                "aboutaccessibilityenabled module",
		                                ABOUT_ACCESSIBILITYENABLED_CONTRACTID,
		                                aLocation, aLoaderStr, aType);
	},

	unregisterSelf: function(aCompMgr, aLocation, aLoaderStr) {
		var compReg = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
		compReg.unregisterFactoryLocation(ABOUT_ACCESSIBILITYENABLED_CID,
		                                  aLocation);
	},

	canUnload: function(aCompMgr) {
		return true;
	}
};

function NSGetModule(compMgr, fileSpec) {
	return AboutAccessibilityEnabledModule;
}
