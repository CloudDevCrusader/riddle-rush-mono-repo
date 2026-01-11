Feature: Game Flow
  As a player
  I want to play through a complete game
  So that I can enjoy the full experience

  Scenario: Navigate to players page
    Given I navigate to "/"
    When I click ".play-btn"
    Then the URL should contain "/players"

  Scenario: Single player game elements
    Given I navigate to "/game"
    Then I should see ".riddle-display, .question"
    And I should see "input[type='text'], .answer-input"

  Scenario: Type answer in game
    Given I navigate to "/game"
    When I type "Berlin" into "input[type='text'], .answer-input"
    Then the input "input[type='text'], .answer-input" should have value "Berlin"
