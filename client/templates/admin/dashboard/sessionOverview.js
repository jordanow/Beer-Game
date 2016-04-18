Template.sessionOverview.onCreated(function() {
  Template.instance().subscribe = Meteor.subscribe('Game.sessions', FlowRouter.getParam('sessionNumber'));
  Template.instance().subscribe = Meteor.subscribe('Game.instances');

  let self = this;

  self.roledemands = new ReactiveVar([]);

  Template.instance().autorun(function() {
    Meteor.call('getChartData', function(err, res) {
      if (res && res.success) {
        self.roledemands.set(res.data);
      }
    });
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
  'click .stopallgames': function(e) {
    e.preventDefault();
    Modal.show('stopallgames');
  }
});
