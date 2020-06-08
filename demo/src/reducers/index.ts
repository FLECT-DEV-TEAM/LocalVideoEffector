

export interface GlobalState {
    counter                           : number
}

export const initialState = {
    counter                             : 0,
}


const reducer = (state: GlobalState = initialState, action: any) => {
    var gs: GlobalState = Object.assign({}, state)
    gs.counter++
    return gs
}

export default reducer;
