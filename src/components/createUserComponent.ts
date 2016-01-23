import {input, div, p, label, button, } from "@cycle/dom";
import {Observable} from "rx";

function processHttpResponse(HTTP){
    let response$ = HTTP.mergeAll().tap(x=> {
        console.log("Response: " + x.statusCode)
    });
    return response$;
}

function createUserInput(DOM) {
    // user input
    return {
        firstNameField$: DOM.select("#firstName").events("input").map(ev => ev.target.value),
        lastNameField$: DOM.select("#lastName").events("input").map(ev => ev.target.value),
        saveClick$: DOM.select(".saveButton").events("click"),
    }
}

function model(userInput, httpResponse$) {
    // construct the model from the firstname and lastname field
    let firstName$ = userInput.firstNameField$.startWith("");
    let lastName$ = userInput.lastNameField$.startWith("");

    let model$ = Observable
        .combineLatest(
        firstName$,
        lastName$,
        (firstName, lastName) => ({ firstName, lastName, response: "" }));

    // if we get a response from the HTTP server we clear the model and show the return code
    // let emptyModel$ = Observable.never();
    let emptyModel$ = httpResponse$.map(resp => ({ firstName: "", lastName: "", response: resp.statusCode }));

    let state$ = model$.merge(emptyModel$);
    return state$;
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

function main(drivers) {
    let DOM = drivers.DOM;
    let HTTP = drivers.HTTP;

    // User input
    let userInput = createUserInput(DOM);
    // HTTP input
    let httpResponse$ = processHttpResponse(HTTP);

    // create state from user and http input
    let state$ = model(userInput, httpResponse$);

    // create the dom
    let vtree$ = view(state$);

    // create the HTTP request from the last state sampled by the button click
    let createUserRequest$ =
        state$
            .sample(userInput.saveClick$)
            .tap(x=> {
                console.log("sample from model: " + x.firstName + " " + x.lastName);
            })
            .map(x => ({
                url: "index.html",
            }))
            .tap(x=> {
                console.log("Request: " + x.url);
            });

    return {
        DOM: vtree$,
        HTTP: createUserRequest$
    }
}
