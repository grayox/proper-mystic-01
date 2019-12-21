const config = {
  // url: 'https://www.realtor.com/realestateagents/greensboro_nc',
  url: 'https://www.realtor.com/realestateagents/greensboro_nc/sort-activelistings/pg-2',
  selectors: {
    cards: '.listview .agent-list-card',
    buttons: {
      email: 'a#inquiry_cta > button',
    },
  },
};

// window.location.replace(config.url);

// const emailButtons = document.querySelectorAll(config.selectors.buttons.email);
// const emailButton = emailButtons[0];
// emailButton.click();

const cards = document.querySelectorAll(config.selectors.cards);