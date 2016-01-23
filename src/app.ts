import {run} from "@cycle/core";
import {makeDOMDriver, input, div, p, label, button, } from "@cycle/dom";
import {makeHTTPDriver} from "@cycle/http";
import {Observable} from "rx";
import {UserListComponent} from "./components/userListComponent";

function main(drivers) {
    let DOM = drivers.DOM;
    let HTTP = drivers.HTTP;

    let dummyUsers = Observable.of([{firstName: "Arno", lastName: "den Uijl"},
                                           {firstName: "Ester", lastName: "van Lierop"},
                                           {firstName: "Miguel", lastName: "Alvares"},
                                           {firstName: "Mark", lastName: "Oosterbaan"}]);

    let userListComponent = UserListComponent({users$: dummyUsers, DOM: DOM});
    userListComponent.User.subscribe(x => console.log(`selected ${x.firstName} ${x.lastName}`));
    return {
        DOM: userListComponent.DOM,
        HTTP: Observable.never()
    };
}

const drivers = {
    DOM: makeDOMDriver("body"),
    HTTP: makeHTTPDriver()
};

run(main, drivers);