import {run} from "@cycle/core";
import {makeDOMDriver, input, div, p, label, button, } from "@cycle/dom";
import {makeHTTPDriver} from "@cycle/http";
import {Observable} from "rx";
import {UserList} from "./components/userList";
import {UserCreate} from "./components/userCreate";

function main(drivers) {
    let DOM = drivers.DOM;
    let HTTP = drivers.HTTP;

    let dummyUsers = Observable.of([{firstName: "Arno", lastName: "den Uijl"},
                                           {firstName: "Ester", lastName: "van Lierop"},
                                           {firstName: "Miguel", lastName: "Alvares"},
                                           {firstName: "Mark", lastName: "Oosterbaan"}]);

    let userList = UserList({users$: dummyUsers, DOM: DOM});
    userList.User.subscribe(x => console.log(`selected ${x.firstName} ${x.lastName}`));

    let toggleCreate$ = DOM.select(".toggle-create").events("click")
                            .scan(acc => !acc, false)
                            .startWith(false);

    let userCreate = UserCreate({DOM, HTTP});

    let vtree$ = Observable.combineLatest(userList.DOM, toggleCreate$ , (dom, toggleCreate) =>
        div([
            dom,
            div([
                button(".toggle-create", "create")
            ]),
            toggleCreate ? userCreate.DOM : ""
        ]));
    return {
        DOM: vtree$,
        HTTP: userCreate.HTTP
    };
}

const drivers = {
    DOM: makeDOMDriver("body"),
    HTTP: makeHTTPDriver()
};

run(main, drivers);