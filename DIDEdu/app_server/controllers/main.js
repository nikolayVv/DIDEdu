var apiParameters = {
    server: "http://localhost:" + (process.env.PORT || 3000)
};
if (process.env.NODE_ENV === "production") {
    apiParameters.server = "https://didedu.herokuapp.com/";
}
const axios = require('axios').create({
   baseURL: apiParameters.server,
   timeout: 5000
});


/* GET home page */
const index = (req, res) => {
     axios.get("/api/universities").then((answer) => {
         showTheData(req, res, answer.count);
     });
};

const showTheData = (req, res, uniCounter) => {
    res.render("index", {
        title: "DIDEdu",
        bonusScripts: "<script src=\"../javascripts/index.js\" type=\"application/javascript\"></script>\n",
        introduction: `<h1 class="text-light pt-4 text-center"><b>Controlling your own Digital Identity</b></h1>
                    <p class="text-light pt-4 text-center">
                        DIDEdu is a decentralized identity system, that is using the PRISM DID platform<br />
                        in order to allow people to control their personal data and to give them <br />
                        the possibility to choose with who and what they share,<br />
                        privately and securely.
                    </p>
                    <div class="d-flex justify-content-center pt-4 pb-4">
                    <a class="text-danger" href="#registerSection"> Join us now </i></a>
                    </div>`,
        abouts: [
            {
                contents: [
                    {
                        header: `<i class='fa fa-2xl fa-lightbulb-o fa-bounce' style="--fa-animation-duration: 3s;"></i> The idea`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    },
                    {
                        header: `<i class="fa-solid fa-2xl fa-cog fa-spin" style="--fa-animation-duration: 15s;"></i> Technology`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    }
                ]
            },
            {
                contents: [
                    {
                        header: `<i class="fa-solid fa-2xl fa-users fa-shake" style="--fa-animation-duration: 10s;" ></i> Users`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    },
                    {
                        header: `<i class="fa-solid fa-2xl fa-lock fa-beat" style="--fa-animation-duration: 5s; "></i> Security`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
                    }
                ]
            }
        ],
        videos: `<div class="col col-12 col-xs-12 col-sm-12 col-md-12 col-lg-4 col-xl-3 pr-3 ps-0 pb-4">
                <ul id="tutorialList" class="ps-0 w-100">
                    <li class="pt-5 pb-2 active tut w-100"><a href="#tutorialSection">Login process</a></li> <br/>
                    <li class="pt-5 pb-2 tut w-100"><a href="#tutorialSection">Checking assignments</a></li> <br/>
                    <li class="pt-5 pb-2 tut w-100"><a href="#tutorialSection">Submitting assignments</a></li> <br/>
                    <li class="pt-5 pb-2 tut w-100"><a href="#tutorialSection">Creating a verification card</a></li> <br/>
                    <li class="pt-5 pb-2 tut w-100"><a href="#tutorialSection">Applying for exam with verification card</a></li>
                </ul>
                </div>
                <div class="col col-12 col-xs-12 col-sm-12 col-md-12 col-lg-8 col-xl-9 d-flex justify-content-center embed-responsive embed-responsive-21by9">
                    <iframe class="embed-responsive-item w-100"  src="https://www.youtube.com/embed/SSo_EIwHSd4" allowfullscreen></iframe>
                </div>`,
        registerTitle: `<b class="containerText1 text-uppercase">Welcome!</b> Universities from all around the world are already part of DIDEdu! It's your turn!`,
        registerSubTitle: "Press the button or give us a call! It won't take more than a few minutes!",
        registerContent: ` We will make the educational process in your university easier and more secure, <br />not only for the students, but also for everyone participating in the education process! <br />Contact us and tell us more about your university and we will register you in DIDEdu in no time! <br />`,
        registerBell: `<i class="fa-solid fa-2xl fa-bell fa-shake"></i>`,
        registerButton: `<a class="btn mt-4 pt-2 mainBtn " href="#contactSection"><h5><b class="text-uppercase"> Register now </b></h5></a>`,
        registerPhone: `<i class="fa fa-phone ps-2" aria-hidden="true"></i> + 01 234 567 88 `,
        questions: [
            {
                contents: [
                    {
                        title: `<b><span class="containerText1"><i class="fa fa-question-circle" aria-hidden="true"></i> Q1:</span> Lorem Ipsum is simply dummy ?</b>`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    },
                    {
                        title: `<b><span class="containerText1"><i class="fa fa-question-circle" aria-hidden="true"></i> Q2:</span> Lorem Ipsum is simply dummy ?</b>`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    },
                    {
                        title: `<b><span class="containerText1"><i class="fa fa-question-circle" aria-hidden="true"></i> Q3:</span> Lorem Ipsum is simply dummy ?</b>`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    }
                ]
            },
            {
                contents: [
                    {
                        title: `<b><span class="containerText1"><i class="fa fa-question-circle" aria-hidden="true"></i> Q4:</span> Lorem Ipsum is simply dummy ?</b>`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    },
                    {
                        title: `<b><span class="containerText1"><i class="fa fa-question-circle" aria-hidden="true"></i> Q5:</span> Lorem Ipsum is simply dummy ?</b>`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    },
                    {
                        title: `<b><span class="containerText1"><i class="fa fa-question-circle" aria-hidden="true"></i> Q6:</span> Lorem Ipsum is simply dummy ?</b>`,
                        body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
                    }
                ]
            }
        ],
        inputGroups: [
            {
                inputs: [
                    {
                        label: `<label for="firstName" class="form-label">First name</label>`,
                        body: `<input type="email" class="form-control" id="firstName" placeholder="First name">`,
                        error: `<div class="invalid-feedback">This field is required</div>`
                    },
                    {
                        label: `<label for="lastName" class="form-label">Last name</label>`,
                        body: `<input type="email" class="form-control" id="lastName" placeholder="Last name">`,
                        error: `<div class="invalid-feedback">This field is required</div>`
                    }
                ]
            },
            {
                inputs: [
                    {
                        label: `<label for="email" class="form-label">Email address</label>`,
                        body: `<input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Email address"><div id="emailHelp" class="form-text">We'll never share your email with anyone else</div>`,
                        error: `<div class="invalid-feedback">This field is required</div>`
                    }
                ]
            },
            {
                inputs: [
                    {
                        label: `<label for="type" class="form-label">Type of message</label>`,
                        body: `<select class="form-select" id="type">
                                <option selected disabled>--Choose type of message--</option>
                                <option value="1">Register University</option>
                                <option value="2">Report a problem</option>
                                <option value="3">Ask a question</option>
                                <option value="4">Other</option>
                            </select>`,
                        error: `<div class="invalid-feedback">This field is required</div>`
                    }
                ]
            },
            {
                inputs: [
                    {
                        label: `<label for="message" class="form-label">Message</label>`,
                        body: `<textarea class="form-control" id="message" placeholder="Message..." rows="9"></textarea>`,
                        error: `<div class="invalid-feedback">This field is required</div>`
                    }
                ]
            }
        ],
        sendIcon: `<span class="display-6 pt-5 ps-5"><i class="containerText1 fa-solid fa-paper-plane fa-10x" style="--fa-rotate-angle: -30deg;"></i></span>`,
        nav: {
            isVisible: true,
            logo: `<a class="navbar-brand ms-3" href="/">DIDEdu</a>
                    <button class="navbar-toggler me-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>`,
            buttons: `<ul class="navbar-nav ms-auto mb-2 mb-lg-0 scroll">
                            <li class="nav-item">
                                <a class="nav-link aboutSection" aria-current="page" href="#aboutSection">About</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link tutorialSection" href="#tutorialSection">How to</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link registerSection" href="#registerSection">Get Started</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link faqSection" href="#faqSection">FAQ</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link contactSection" href="#contactSection">Contact us</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav ms-auto">
                            <a href="/auth/universities" class="btn mainBtn pt-3 pb-3 pe-4 ps-4 mt-1 me-3 w-100">
                                Log In
                            </a>
                        </ul>`
        }
    });
}

module.exports = {
    index
};