import {input, table, tr, td, th, div, p, label, button, } from "@cycle/dom";
import {Observable} from "rx";

interface Actions {
    hoverRow$: Observable<number>;
    selectedRowNumer$: Observable<number>;
}

function intent(DOM): Actions {
    let hoverRow$ = DOM.select(".row").events("mouseenter")
        .map(ev => ev.currentTarget.dataset.index)
        .filter(x => typeof x !== "undefined")
        .map(x => parseInt(x));

    let selectedRowNumer$: Observable<number> = DOM.select(".row").events("click")
        .map(ev => ev.currentTarget.dataset.index)
        .filter(x => typeof x !== "undefined")
        .map(x => parseInt(x));

    return {
        hoverRow$,
        selectedRowNumer$
    };
}


interface State {
    users$: Observable<User[]>;
    highlightedRow$: Observable<number>;
    selectedUser$: Observable<User>;
}

function model(actions, users$): State {
    let highlightedRow$ = actions.hoverRow$.startWith(-1);
    let selectedUser$ = actions.selectedRowNumer$.withLatestFrom(users$, (index, users) => users[index]);

    return {
        users$,
        highlightedRow$,
        selectedUser$
    };
}

function view(state: State) {
    let vtree$ = state.users$.combineLatest(state.highlightedRow$, (users, selectedRow) => ({ users, selectedRow }))
    .map(state => {
        return table([
            tr([
                td("", "First name"),
                td("", "Last name")
            ]),
            state.users.map((user, index) =>
                tr(".row", { attributes: { "data-index": index }, style: { "background-color": index === state.selectedRow ? "#8FE8B4" : null } }, [
                    td("", user.firstName),
                    td("", user.lastName)
                ])
            )
        ]);
    });
    return vtree$;
}

interface UserListComponentSources {
    DOM: Observable<any>;
    users$: Observable<Array<User>>;
}

interface UserListComponentSinks {
    DOM: any;
    User: Observable<User>;
}

export function UserListComponent(sources: UserListComponentSources): UserListComponentSinks {
    let DOM = sources.DOM;
    let users$ = sources.users$;

    let actions = intent(DOM);
    let state = model(actions, users$);

    let vtree$ = view(state);

    return {
        DOM: vtree$,
        User: state.selectedUser$
    };
}