import {input, div, p, label, button, } from "@cycle/dom";
import {Observable} from "rx";


interface UserDetailComponentSources {
    user$: Observable<User>;
}

interface UserDetailComponentSinks {
    DOM: Observable<any>;
}

function UserDetailComponent(sources: UserDetailComponentSources): UserDetailComponentSinks {
    let vtree$ = sources.user$.map(user =>
        div([
            div([
                label(".detailLabel", "First name"),
                input(".firstName", user.firstName),
            ]),
            div([
                label(".detailLabel", "Last name"),
                input(".firstName", user.lastName),
            ]),
        ])
    );

    return {
        DOM: vtree$
    };
}