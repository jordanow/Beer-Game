let _checkIfSettingsExist = () => {
  return Game.settings.find().count() < 1 ? false : true;
};

let _saveSetting = (setting) => {
  return Game.settings.insert(setting);
};

let generateSettings = () => {
  let settingsExist = _checkIfSettingsExist();

  if (!settingsExist) {
    let setting = {
      cost: {
        inventory: 2,
        backorder: 2
      },
      delay: 2,
      customerdemand: [2, 2, 2, 4, 6, 8, 10, 14, 20, 24, 16, 10, 6, 2, 2, 2]
    };
    _saveSetting(setting);
  }
};

Modules.server.generateSettings = generateSettings;
