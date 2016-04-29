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
      customerdemand: [{
        week: 0,
        value: 2
      }, {
        week: 1,
        value: 2
      }, {
        week: 2,
        value: 5
      }, {
        week: 3,
        value: 6
      }, {
        week: 4,
        value: 7
      }, {
        week: 5,
        value: 5
      }, {
        week: 6,
        value: 6
      }, {
        week: 7,
        value: 8
      }, {
        week: 8,
        value: 8
      }, {
        week: 9,
        value: 2
      }, {
        week: 10,
        value: 2
      }]
    };
    _saveSetting(setting);
  }
};

Modules.server.generateSettings = generateSettings;