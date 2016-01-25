import {input, div, p, label, button, } from "@cycle/dom";
import {Observable} from "rx";


interface UserDetailSources {
    user$: Observable<User>;
}

interface UserDetailSinks {
    DOM: Observable<any>;
}

function UserDetailComponent(sources: UserDetailSources): UserDetailSinks {
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