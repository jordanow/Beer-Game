let startup = () => {
  _setEnvironmentVariables();
  _setBrowserPolicies();
  _generateAccounts();
  _generatePages();
  _generateSettings();
};

var _setEnvironmentVariables = () => Modules.server.setEnvironmentVariables();

var _setBrowserPolicies = () => {};

var _generateAccounts = () => Modules.server.generateAccounts();
var _generatePages = () => Modules.server.generatePages();
var _generateSettings = () => Modules.server.generateSettings();

Modules.server.startup = startup;
