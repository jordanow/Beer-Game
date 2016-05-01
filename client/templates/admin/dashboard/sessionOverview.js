  // Admin
  // Give a per game stop and delete button

  // Delivery in delay applies to everyone and not just the manufacturer - everyone gets their order after x weeks.
  //
  // Next meet on tuesday next week.

  Template.sessionOverview.onCreated(function() {
    Template.instance().subscribe = Meteor.subscribe('Game.sessions', FlowRouter.getParam('sessionNumber'));
    Template.instance().subscribe = Meteor.subscribe('Game.instances');
    let self = this;

    self.chartHeight = new ReactiveVar(300);
    self.roledemands = new ReactiveVar([]);
  });

  Template.sessionOverview.helpers({
    instances: function() {
      let session = Game.sessions.findOne({
        key: Number(FlowRouter.getParam('sessionNumber'))
      });

      if (session && session._id) {
        return Game.instances.find({
          session: session._id
        }, {
          sort: {
            createdAt: -1
          }
        }).fetch();
      }
    },
    canstopgames: function() {
      let session = Game.sessions.findOne({
        key: Number(FlowRouter.getParam('sessionNumber'))
      });

      if (session && session._id) {
        return Game.instances.find({
          session: session._id,
          state: 'play'
        }).count() > 0;
      } else {
        return false;
      }
    },
    session: function() {
      return Game.sessions.findOne({
        key: Number(FlowRouter.getParam('sessionNumber'))
      });
    },
    statehelper: function(state) {
      if (state === 'play') {
        return 'In progress';
      } else {
        return 'Stopped';
      }
    },
    progressreports: function() {
      let instances = Game.instances.find().fetch();

      return instances;
    },
    currentweek: function(role, instanceId) {
      let instance = Game.instances.findOne({
        _id: instanceId
      });


      if (instance && instance[role] && instance[role].week) {
        return instance[role].week;
      } else {
        return 0;
      }
    },
    playernumber: function(role, instanceId) {
      let instance = Game.instances.findOne({
        _id: instanceId
      });


      if (instance && instance[role] && instance[role].player && instance[role].player.key) {
        return instance[role].player.key;
      } else {
        return '?';
      }
    },
    canstopgame: function(game) {
      return game.state === 'play';
    },
    bullwhipcart: function() {
      let roledemands = Template.instance().roledemands.get();

      let customerdemand = [],
        wholesalerdemand = [],
        distributordemand = [],
        manufacturerdemand = [],
        retailerdemand = [];

      let session = Game.sessions.findOne({
        key: Number(FlowRouter.getParam('sessionNumber'))
      });

      if (!!session && session.settings) {
        customerdemand = _.pluck(session.settings.customerdemand, 'value');
      }

      if (roledemands.retailer) {
        retailerdemand = roledemands.retailer;
      }
      if (roledemands.wholesaler) {
        wholesalerdemand = roledemands.wholesaler;
      }
      if (roledemands.distributor) {
        distributordemand = roledemands.distributor;
      }
      if (roledemands.manufacturer) {
        manufacturerdemand = roledemands.manufacturer;
      }

      return {
        chart: {
          type: 'line',
          height: Template.instance().chartHeight.get() || 300,
          marginBottom: 100
        },
        title: {
          text: 'Bull whip effect'
        },
        subtitle: {
          text: 'Growth in orders per week'
        },
        xAxis: {
          min: 0,
          title: {
            text: 'Weeks'
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Orders',
          },
          labels: {
            overflow: 'justify'
          }
        },
        /*tooltip: {
          valueSuffix: ' millions'
        },*/
        plotOptions: {
          series: {
            animation: {
              duration: 1000
            }
          },
          column: {
            dataLabels: {
              enabled: true
            }
          }
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'top',
          x: -40,
          y: 80,
          // floating: true,
          borderWidth: 1,
          backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
          shadow: true
        },
        credits: {
          enabled: false
        },
        series: [{
          name: 'Customers',
          data: customerdemand
        }, {
          name: 'Retailers',
          data: retailerdemand
        }, {
          name: "Wholesalers",
          data: wholesalerdemand
        }, {
          name: 'Distributor',
          data: distributordemand
        }, {
          name: 'Manufacturer',
          data: manufacturerdemand
        }]
      };
    }
  });

  Template.sessionOverview.events({
    'click .incChartHeight': function(e, tpl) {
      e.preventDefault();
      let height = tpl.chartHeight.get();
      tpl.chartHeight.set(height + 50);
    },
    'click .decChartHeight': function(e, tpl) {
      e.preventDefault();
      let height = tpl.chartHeight.get();
      if (height >= 300) {
        tpl.chartHeight.set(height - 50);
      }
    },
    'click .modal-create-games': function(e) {
      e.preventDefault();
      Modal.show('createGames');
    },
    'click .modal-session-settings': function(e) {
      e.preventDefault();
      Modal.show('sessionSettings');
    },
    'click .resumeallgames': function(e) {
      e.preventDefault();
      Meteor.call('resumeallgames', FlowRouter.getParam('sessionNumber'), function(err) {
        if (err) {
          Bert.alert(err.message, 'danger');
        }
      });
    },
    'click .resumethisgame': function(e) {
      e.preventDefault();
      Meteor.call('updategamestate', this._id, 'play');
    },
    'click .stopthisgame': function(e) {
      e.preventDefault();
      Modal.show('stopgame', this);
    },
    'click .stopallgames': function(e) {
      e.preventDefault();
      Modal.show('stopallgames');
    },
    'click .deletesession': function() {
      let self = this;
      let res = confirm('Are you sure you want to delete this session? This will delete all data related to this session. Note: This action cannot be reversed!');

      if (!!res) {
        Meteor.call('deleteSession', FlowRouter.getParam('sessionNumber'), function(err) {
          if (err) {
            Bert.alert(err.message, 'danger');
          } else {
            FlowRouter.go('/admin/overview');
          }
        });
      }
    },
    'click .openchart': function(e, tpl) {
      let instance = this;
      Meteor.call('getChartData', instance._id, function(err, res) {
        if (res && res.success) {
          tpl.roledemands.set(res.data);
        }
      });
    }
  });