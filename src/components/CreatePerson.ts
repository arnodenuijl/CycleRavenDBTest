import {Observable} from 'rx';
import {div, input, p, label, button} from '@cycle/dom';

class Model {
    constructor(public firstName: string, public lastName: string) {
    }
}

interface Actions {
    firstName$: Observable<string>;
    lastName$: Observable<string>;
    saveClick$: Observable<any>;
    clearClick$: Observable<any>;
}

function intent(DOM: any): Actions {
    const firstName$: Observable<string> = DOM.select('#firstName').events('input').map(ev => ev.target.value);
    const lastName$: Observable<string> = DOM.select('#lastName').events('input').map(ev => ev.target.value);
    const saveClick$: Observable<any> = DOM.select('.saveButton').events('click');
    const clearClick$: Observable<any> = DOM.select('.clearButton').events('click');
    return {
        firstName$,
        lastName$,
        saveClick$,
        clearClick$
    };
}

function model(actions: Actions, response$): Observable<Model> {
    
    let firstName$ = actions.firstName$.startWith("");
    let lastName$ = actions.lastName$.startWith("");
    let model$ = Observable
                        .combineLatest(
                            firstName$, 
                            lastName$, 
                            (firstName, lastName) => ({firstName, lastName}));
    let emptyModel$ = response$.map(_ => ({firstName: "" , lastName: ""}));                        
    return model$.merge(emptyModel$);
}

function view(state$: Observable<Model>, response$): Observable<any> {
    return response$
        .startWith(1)
        .map( _ =>
            div([
                label('', 'First name:'),
                input('#firstName', { type: 'text' }),
                label('', 'Last name:'),
                input('#lastName', { type: 'text' }),
                button('.saveButton', 'Opslaan'),
                button('.clearButton', 'Wissen')
            ]));

}

export function CreatePerson(DOM, HTTP) {
    const actions = intent(DOM);


    let response$ = HTTP.mergeAll().tap(x=> {
        console.log("Response" + x)
    });
    const state$ = model(actions, response$);

    const vtree$ = view(state$, response$);

    let createUserRequest$ = 
        state$
        .tap(x=> console.log("model value" +x))
        .sample(actions.saveClick$)
        .tap(x=> {
            console.log("sample" + x);
        })
        .map(x => ({
            url: 'http://localhost:8081/databases/cycletest/docs',
            method: 'POST',
            send: x
        }))
        .tap(x=> {
            console.log("Request" + x);
        });

    return {
        DOM: vtree$,
        HTTP: createUserRequest$
    }
}
