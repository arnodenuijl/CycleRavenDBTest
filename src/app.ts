import {CreatePerson} from './components/CreatePerson';
import {run} from '@cycle/core';
import {makeDOMDriver, div, input, p} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';
import {Observable} from 'rx';

function main(drivers) {    
    let createPerson = CreatePerson(drivers.DOM, drivers.HTTP);
    return createPerson;
}

const drivers = {
  DOM: makeDOMDriver('body'),
  HTTP: makeHTTPDriver()
};

run(main, drivers);
