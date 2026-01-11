Feature: Credits Page
  As a user
  I want to view the credits page
  So that I can see who created the game

  Scenario: Credits page loads successfully
    Given I navigate to "/credits"
    Then I should see ".title-image"
    And I should see ".credits-panel"

  Scenario: Display team credits
    Given I navigate to "/credits"
    Then I should see ".credits-panel"
    And I should see 3 elements matching ".credit-section"
    And I should see text "Game Design"
    And I should see text "Programming"
    And I should see text "Art"

  Scenario: Back button navigation
    Given I navigate to "/credits"
    When I click ".back-btn"
    Then the URL should be "/"

  Scenario: OK button navigation
    Given I navigate to "/credits"
    When I click ".ok-btn"
    Then the URL should be "/"
