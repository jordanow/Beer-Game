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

## Starting your first game
- The default credentials for the admin section are : 
email     : "admin@admin.com"
password  : "password"

- Log in to the admin section.
- Create a session
  - You can modify session settings from the admin section.
- Create a game under that session.
  - Each game played under a given session gets all the settings from the session. 
  - The session settings can also be changed while games are in play.
- Now open 4 tabs and use the game key (generated in previous step) to join a game.
  - It'd ask you to select a role before joining a game.
  - If all the roles are taken, it won't allow more people to join in.
- The game will commence as soon as all the 4 players - Distributor, Retailer, Wholesaler and Manufacturer join in.
  - Every player has to enter in the amount of beers they want to order for the current week.
  - The Retailer will get the demand from the Customer. 
    - Customer demand can be set in admin section. Each session has a set of beer orders(demand) already set in for a number of weeks. 
- Please note that the deliveries will start coming in only after the "delay" (delay in number of weeks can be found in session settings). 

The objective of the game is to manage an amount of beers in such a way that each player is able to serve the needs of the customer and also does not end up increasing the inventory costs by over stocking.

More details can be found at `beergame.org`
