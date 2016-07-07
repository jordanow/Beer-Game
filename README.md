# Beer Game
A fun game to understand the basics of supply chain management

## What?
- As per [beergame.org](http://www.beergame.org/), 
  "The beergame is a role-play simulation game that lets students experience typical coordination problems of (traditional) supply chains, in which information sharing and collaboration does not exist. In more general terms, this supply chain represents any non-coordinated system in which problems arise due to lack of systemic thinking."
- This game is a depiction of a supply chain and, hence, simulates the four stages - retailer, wholesaler, distributor and factory. 
- Each supply chain produces and delivers certain units of beer. We'd be dealing with orders (flowing upstream) and deliveries (flowing downstream).
 
## Goal
- The goal of this game is to minimise the total cost for everyone in the supply chain by maintaining low stocks yet managing to deliver all the orders.

## How to play
- Each stage/group has to fulfil the incoming orders of beer. 
- The important aspect to be noted here is the delay or time lag between the various stages of the supply chain owing to the logistics and production time. Each delivery requires 2<sup>*</sup> rounds until they are finally delivered to the next stage. 
- `Customer -> Retailer -> Wholesaler -> (n week delay) -> Distributor -> (n week delay) -> Factory`

## Scoring
- Each role/player starts with a balance of $50.
- Each unused unit of beer at the end of the week will incur a cost of $1<sup>*</sup> as handling charges.
- Each unit in backlog (backorders) will cost $2<sup>*</sup> per week.
- Each unit of beer sold will bring $4<sup>*</sup> in profits.


## How to setup the app
- Install [NodeJS](https://nodejs.org/en/download/)
- Install [MeteorJS](https://www.meteor.com/install)
- `npm start`
