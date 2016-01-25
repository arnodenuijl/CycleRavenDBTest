import {input, table, tr, td, th, div, p, label, button, } from "@cycle/dom";
import {Observable} from "rx";
import {toggle} from "../arrayToggle";

interface UserListSources {
    DOM: Observable<any>;
    users$: Observable<Array<User>>;
}

interface UserListSinks {
    DOM: any;
    User: Observable<User>;
}

interface UserListActions {
    hoverRow$: Observable<number>;
    clickedRowNumer$: Observable<number>;
}

interface UserListState {
    users$: Observable<User[]>;
    highlightedRow$: Observable<number>;
    selectedUsers$: Observable<User>;
    selectedRowNumbers$: Observable<number[]>;
}

function intent(DOM): UserListActions {
    let hoverRow$ = DOM.select(".row").events("mouseenter")
        .map(ev => ev.currentTarget.dataset.index)
        .filter(x => typeof x !== "undefined")
        .map(x => parseInt(x));

    let clickedRowNumer$: Observable<number> = DOM.select(".row").events("click")
        .map(ev => ev.currentTarget.dataset.index)
        .filter(x => typeof x !== "undefined")
        .map(x => parseInt(x));

    return {
        hoverRow$,
        clickedRowNumer$
    };
}

function model(actions: UserListActions, users$): UserListState {
    let highlightedRow$ = actions.hoverRow$.startWith(-1);
    let selectedRowNumbers$ = actions.clickedRowNumer$.scan((acc: Array<number>, x: number)  => toggle(acc, x), new Array<number>()).startWith([]);
    let selectedUsers$ = selectedRowNumbers$.withLatestFrom(users$, (index, users) => users[index]);

    return {
        users$,
        highlightedRow$,
        selectedUsers$,
        selectedRowNumbers$
    };
}

function selectRowColor(index: number, highlightedRow: number, selectedRows: number[]) {
    let highlighted = index === highlightedRow;
    let selected = selectedRows.indexOf(index) >= 0;
    if (highlighted && selected) return "#222222";
    if (highlighted) return "#333333";
    if (selected) return "#444444";
    return "#ffffff";
}

function view(state: UserListState) {
    let vtree$ = Observable.combineLatest(state.users$, state.highlightedRow$, state.selectedRowNumbers$,
                    (users, highlightedRow, selectedRows) => ({ users, highlightedRow, selectedRows }))
    .map(state => {
        return div([
                table([
                    tr([
                        td("", "Id"),
                        td("", "First name"),
                        td("", "Last name")
                    ]),
                    state.users.map((user, index) =>
                        tr(".row", {
                                attributes: {
                                    "data-index": index },
                                    "style": { "background-color": selectRowColor(index, state.highlightedRow, state.selectedRows)}
                                }, [
                                td("", user.id),
                                td("", user.firstName),
                                td("", user.lastName)
                            ])
                    )
                ])
        ]);
    });
    return vtree$;
}

export function UserList(sources: UserListSources): UserListSinks {
    let DOM = sources.DOM;
    let users$ = sources.users$;

    let actions = intent(DOM);
    let state = model(actions, users$);

    let vtree$ = view(state);

    return {
        DOM: vtree$,
        User: state.selectedUsers$
    };
}
11