# Specification Document

Please fill out this document to reflect your team's project. This is a living document and will need to be updated regularly. You may also remove any section to its own document (e.g. a separate standards and conventions document), however you must keep the header and provide a link to that other document under the header.

Also, be sure to check out the Wiki for information on how to maintain your team's requirements.

## TeamName

Trade Wars - Team 8

### Project Abstract

<!--A one paragraph summary of what the software will do.-->

For this project our team will be creating an app that tracks the stock market and allows users to buy, sell, and otherwise interact with this market. It will include actual stock data scraped (in real time). It will make use of a database to store client/user data, including account names and passwords. 


### Customer
<!--A bri description of the customer for this software, both in general (the population who might eventually use such a system) and specifically for this document (the customer(s) who informed this document). Every project will have a customer from the CS506 instructional staff. Requirements should not be derived simply from discussion among team members. Ideally your customer should not only talk to you about requirements but also be excited later in the semes-->

The customers for this application will be users interested in investing in the stock market. This will include people that are invested in keeping up to date with stock market fluctuations and individuals that invest in certain stocks. 

### Specification

<!--A detailed specification of the system. UML, or other diagrams, such as finite automata, or other appropriate specification formalisms, are encouraged over natural language.-->

<!--Include sections, for example, illustrating the database architecture (with, for example, an ERD).-->

<!--Included below are some sample diagrams, including some example tech stack diagrams.-->

#### Technology Stack

<!-- Here are some sample technology stacks that you can use for inspiration: -->


```mermaid
flowchart RL
subgraph Front End
	A(Javascript: React)
end
	
subgraph Back End
	B(Java: SpringBoot)
end
	
subgraph Database
	C[(MySQL)]
end

A <-->|REST API| B
B <--> C
```

#### Database

```mermaid
---
title: Database ERD for a Stock Brokerage
---
erDiagram
    User {
        int id PK
        string name
        string email
        string password
        DateTime createdAt
        DateTime lastLoginAt
    }
```
<!-- 
    User ||--o{ Order : "placed by"
    <!-- Order ||--o{ OrderItem : "contains"
    Product ||--o{ OrderItem : "included in"
    
    Order {
        int order_id PK
        int customer_id FK
        string order_date
        string status
    }

    Product {
        int product_id PK
        string name
        string description
        decimal price
    }

    OrderItem {
        int order_item_id PK
        int order_id FK
        int product_id FK
        int quantity
    } -->

#### Class Diagram

```mermaid
---
title: Class Diagram for TradeWar's Program (next- add Account class)
---
classDiagram
    class User {
        - int id PK
        - String name
        - String email
        - String password
        - DateTime createdAt
        - DateTime lastLoginAt
        + ResponseEntity<User> addUser()
        + ResponseEntity<User> loginUser()
        + ResponseEntity<List<User>> getAllUsers()
    }
```
<!-- class Dog {
        + Dog(String name)
        + void makeSound()
    }
    class Cat {
        + Cat(String name)
        + void makeSound()
    }
    class Bird {
        + Bird(String name)
        + void makeSound()
    }
    Animal <|-- Dog
    Animal <|-- Cat
    Animal <|-- Bird -->

#### Sequence Diagram

```mermaid
sequenceDiagram

participant ReactFrontend
participant SpringBoot
participant MySQLDatabase

ReactFrontend ->> SpringBoot: HTTP Request: POST /api/users/signup
activate SpringBoot

SpringBoot ->> MySQLDatabase: INSERT INTO users (name, email, password)
activate MySQLDatabase

MySQLDatabase -->> SpringBoot: Returns User Object
deactivate MySQLDatabase

SpringBoot -->> ReactFrontend: JSON Response (201 Created)
deactivate SpringBoot

ReactFrontend ->> SpringBoot: HTTP Request: POST /api/users/login
activate SpringBoot

SpringBoot ->> MySQLDatabase: SELECT * FROM users WHERE email = ?
activate MySQLDatabase

MySQLDatabase -->> SpringBoot: Returns Auth Token
deactivate MySQLDatabase

SpringBoot -->> ReactFrontend: JSON Response (200 Success + Auth Token)
deactivate SpringBoot
```





<br>
<br>
<br>
<br>
<br>
<br>
<br>


#### Flowchart

```mermaid
---
title: Sample Program Flowchart
---
graph TD;
    Start([Start]) --> Input_Data[/Input Data/];
    Input_Data --> Process_Data[Process Data];
    Process_Data --> Validate_Data{Validate Data};
    Validate_Data -->|Valid| Process_Valid_Data[Process Valid Data];
    Validate_Data -->|Invalid| Error_Message[/Error Message/];
    Process_Valid_Data --> Analyze_Data[Analyze Data];
    Analyze_Data --> Generate_Output[Generate Output];
    Generate_Output --> Display_Output[/Display Output/];
    Display_Output --> End([End]);
    Error_Message --> End;
```

#### Behavior

```mermaid
---
title: Sample State Diagram For Coffee Application
---
stateDiagram
    [*] --> Ready
    Ready --> Brewing : Start Brewing
    Brewing --> Ready : Brew Complete
    Brewing --> WaterLowError : Water Low
    WaterLowError --> Ready : Refill Water
    Brewing --> BeansLowError : Beans Low
    BeansLowError --> Ready : Refill Beans
```


### Standards & Conventions

<!--This is a link to a seperate coding conventions document / style guide-->
[Style Guide & Conventions](STYLE.md)
