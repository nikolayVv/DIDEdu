const hbs = require('hbs');

hbs.registerHelper("inputs", (inputs) => {
    let inputsResult = ``;
    if (inputs.length === 1) {
        inputsResult = `<div class="col col-sm-12 col-xl-12">
                        ${inputs[0].label}
                        ${inputs[0].body}
                        ${inputs[0].error}
                  </div>`;
    } else if (inputs.length > 1) {
        for (let i = 0; i < inputs.length; i++) {
            inputsResult += `<div class="col col-xl-6">
                            ${inputs[i].label}
                            ${inputs[i].body}
                            ${inputs[i].error}
                       </div>`;
        }
    }

    return inputsResult;
});

hbs.registerHelper("navigation", (nav) => {
    let navigationResult = ``;
    if (nav.isVisible) {
        navigationResult = `<header>
                <nav class="navbar fixed-top navbar-expand-xl navbar-light bg-light p-0">
                    <div class="container-fluid p-0">
                        ${nav.logo}
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            ${nav.buttons}
                        </div>
                    </div>
                </nav>
            </header>`;
    }

    return navigationResult;
});