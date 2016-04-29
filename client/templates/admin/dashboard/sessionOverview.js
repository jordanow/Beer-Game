  // Admin
  // Give a per game stop and delete button

  // Delivery in delay applies to everyone and not just the manufacturer - everyone gets their order after x weeks.
  //
  // Next meet on tuesday next week.

  Template.sessionOverview.onCreated(function() {
    Template.instance().subscribe = Meteor.subscribe('Game.sessions', FlowRouter.getParam('sessionNumber'));
    Template.instance().subscribe = Meteor.subscribe('Game.instances');
    let self = this;

    self.roledemands = new ReactiveVar([]);

    Template.instance().autorun(function() {
      let session = Game.sessions.findOne({
        number: Number(FlowRouter.getParam('sessionNumber'))
      });
      if (session && session._id) {
        Template.instance().weekdata = Meteor.subscribe('LastWeekPubs', session._id);
      }
    });

  });

  Template.sessionOverview.helpers({
    instances: function() {
      let session = Game.sessions.findOne({
        number: Number(FlowRouter.getParam('sessionNumber'))
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
        number: Number(FlowRouter.getParam('sessionNumber'))
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
        number: Number(FlowRouter.getParam('sessionNumber'))
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
      let weeks = Game.weeks.find().fetch();

      return _.uniq(weeks, 'week', function(w) {
        return w.week.toString();
      });
    },
    currentweek: function(role) {
      let currentweek = Game.weeks.findOne({
        'player.role': role
      }, {
        sort: {
          week: -1
        }
      });

      if (currentweek && currentweek.week) {
        return currentweek.week;
      } else {
        return 0;
      }
    },
    playernumber: function(role) {
      let currentweek = Game.weeks.findOne({
        'player.role': role
      }, {
        sort: {
          week: -1
        }
      });

      if (currentweek && currentweek.player && currentweek.player.number) {
        return currentweek.player.number;
      } else {
        return '?';
      }
    },
    instancekey: function(instanceId) {
      let instance = Game.instances.findOne({
        _id: instanceId
      });
      if (instance && instance.key) {
        return instance.key;
      } else {
        return '-';
      }
    },
    bullwhipcart: function() {
      let roledemands = Template.instance().roledemands.get();

      let customerdemand = [],
        wholesalerdemand = [],
        distributordemand = [],
        manufacturerdemand = [],
        retailerdemand = [];

      let session = Game.sessions.findOne({
        number: Number(FlowRouter.getParam('sessionNumber'))
      });

      if (!!session && session.settings) {
        customerdemand = session.settings.customerdemand;
      }

      if (roledemands.retailer) {
        retailerdemand = roledemands.retailer;
      }
      if (roledemands.wholesaler) {
        retailerdemand = roledemands.wholesaler;
      }
      if (roledemands.distributor) {
        retailerdemand = roledemands.distributor;
      }
      if (roledemands.manufacturer) {
        retailerdemand = roledemands.manufacturer;
      }

      return {
        chart: {
          type: 'line',
          height: 300,
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