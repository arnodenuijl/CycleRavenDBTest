import {input, div, p, label, button, } from "@cycle/dom";
import {Observable} from "rx";

interface UserCreateSources {
    DOM: any;
    HTTP: any;
}

interface UserCreateSinks {
    DOM: any;
    HTTP: any;
}

interface UserCreateState {
    viewState$: Observable<UserViewState>;
}

interface UserViewState {
    firstName: string;
    lastName: string;
    response: string;
}

interface UserCreateIntent {
    firstNameField$: Observable<string>;
    lastNameField$: Observable<string>;
    saveClick$: Observable<any>;
}

function processHttpResponse(HTTP) {
    let response$ = HTTP.mergeAll().tap(x => {
        console.log("Response: " + x.statusCode);
    }).share();
    return response$;
}

function intent(DOM) {
    // user input
    return {
        firstNameField$: DOM.select("#firstName").events("input").map(ev => ev.target.value),
        lastNameField$: DOM.select("#lastName").events("input").map(ev => ev.target.value),
        saveClick$: DOM.select(".saveButton").events("click").tap(x => console.log("save click!"))
    };
}

function model(userInput: UserCreateIntent, httpResponse$): UserCreateState {
    // if we get a response from the HTTP server we clear the model and show the return code
    // let emptyModel$ = Observable.never();
    let empty$: Observable<string> = httpResponse$.map(resp => "");

    // construct the model from the firstname and lastname field
    let firstName$ = userInput.firstNameField$.merge(empty$).startWith("");
    let lastName$ = userInput.lastNameField$.merge(empty$).startWith("");

    let model$: Observable<UserViewState> = Observable.combineLatest(firstName$, lastName$, (firstName, lastName) => ({firstName, lastName, response: ""}));

    let state = {
        viewState$: model$
    };
    return state;
}

function view(state$) {
    let vtree$ = state$
        .map(state =>
            div([
                label("", "First name:"),
                input("#firstName", { type: "text", value: state.firstName }),
                label("", "Last name:"),
                input("#lastName", { type: "text", value: state.lastName }),
                p("", state.response),
                button(".saveButton", "Opslaan"),
            ]));
    return vtree$;
}

export function UserCreate(sources: UserCreateSources): UserCreateSinks {
    let DOM = sources.DOM;
    let HTTP = sources.HTTP;

    // User input
    let actions = intent(DOM);
    // actions.saveClick$.subscribe(x => console.log("click " + x));

    // HTTP input
    let httpResponse$ = processHttpResponse(HTTP);

    // create state from user and http input
    let state = model(actions, httpResponse$);

    // create the dom
    let vtree$ = view(state.viewState$);

    // create the HTTP request from the last state sampled by the button click
    let createUserRequest$ =
        state.viewState$
            .sample(actions.saveClick$)
            .tap(x => console.log("save!"))
            .map(x => ({
                url: "http://localhost.fiddler:8081/databases/cycletest/docs/",
                method: "POST",
                send: x,
                headers: {"Raven-Entity-Name": "User"}
            }));

    return {
        DOM: vtree$,
        HTTP: createUserRequest$
    };
}
