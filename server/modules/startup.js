let startup = () => {
  _setEnvironmentVariables();
  _setBrowserPolicies();
  _generateAccounts();
  _generatePages();
};

var _setEnvironmentVariables = () => Modules.server.setEnvironmentVariables();

var _setBrowserPolicies = () => {};

var _generateAccounts = () => Modules.server.generateAccounts();
var _generatePages = () => Modules.server.generatePages();

Modules.server.startup = startup;
