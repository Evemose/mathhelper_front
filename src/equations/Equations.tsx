import Equation, {CreateEquationDto, equationFetcher} from "./Equation.ts";
import React, {useEffect, useState} from "react";
import {Button, TextField} from "@mui/material";
import {RangeFilter, SearchFilter, TraitFilter} from "../filtering/FilteringComponents.tsx";
import {Add, Close, Delete} from "@mui/icons-material";

const EquationsContext
    = React.createContext<{
    equations: Equation[],
    setEquations: React.Dispatch<React.SetStateAction<Equation[]>>
}>(null as unknown as {
    equations: Equation[],
    setEquations: React.Dispatch<React.SetStateAction<Equation[]>>
});

export const FiltersContext = React.createContext<{
    filters: Map<string, string | string[]>,
    setFilters: React.Dispatch<React.SetStateAction<Map<string, string | string[]>>>
}>(null as unknown as {
    filters: Map<string, string | string[]>,
    setFilters: React.Dispatch<React.SetStateAction<Map<string, string | string[]>>>
});

function Header() {
    return (
        <header className="h-28 flex justify-center bg-gray-300 items-center shadow-2xl mb-10">
            <h1 className="text-5xl font-serif font-bold">Math helper</h1>
        </header>
    )
}

function Filters() {
    const {equations} = React.useContext(EquationsContext);
    return (
        <div className="w-1/5 flex flex-col items-center gap-4">
            <h2 className="font-bold">Filters</h2>
            <div className="flex flex-col items-center gap-10">
                <SearchFilter filterContext={FiltersContext}/>
                <RangeFilter
                    rangeName="solutionsCount"
                    min={0}
                    max={equations.sort((a, b) =>
                        b.solutions.length - a.solutions.length)[0]?.solutions.length ?? 1}
                    label = "Number of solutions"
                    step={1}
                    filterContext={FiltersContext}/>
                <TraitFilter
                    filterContext={FiltersContext}
                    trait="solutions"
                    label="Must contain solution"/>
            </div>
        </div>
    );
}


function AddEquationCard() {
    const {equations, setEquations} = React.useContext(EquationsContext);
    const [validationMessage, setValidationMessage]
        = React.useState<string>("");

    async function addEquation(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const createEquationDto = new CreateEquationDto(event.currentTarget.equation.value);
        const result = await equationFetcher.create(createEquationDto);
        console.log(result);
        if (result.isOk) {
            const equation = await equationFetcher.getByUri(result.location as string);
            if (equation) {
                setEquations([equation, ...equations]);
            }
        } else {
            setValidationMessage(result.message
                .replace('\\"', "")
                .replace(result.message[0],
                    result.message[0].toUpperCase()));
        }
    }

    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        setValidationMessage("");
    }

    return (
        <div className="w-5/6 flex flex-col items-center justify-center
        bg-blue-300 rounded-xl shadow-2xl h-36 gap-2">
            <h1 className="text-3xl font-serif font-bold">Add equation</h1>
            <form onSubmit={addEquation} className="flex justify-around w-5/6 items-center gap-2">
                <TextField
                    variant="filled"
                    className="bg-white rounded w-1/2"
                    label="Equation"
                    name="equation"
                    size="small"
                    error={validationMessage.length > 0}
                    onChange={onChange}
                    fullWidth={true}
                    InputProps={{disableUnderline: true}}
                    helperText={validationMessage.replace('[', '').replace(']', '')}/>
                <Button
                    variant="contained"
                    type="submit"
                    className="w-1/6 h-4/5">
                    Add
                </Button>
            </form>
        </div>
    );
}

function EquationCard(props: { equation: Equation }) {
    const {equations, setEquations} = React.useContext(EquationsContext);

    const [isRootInputFieldVisible, setRootInputFieldVisible]
        = useState(false);

    async function deleteEquation() {
        const isDeleted = await equationFetcher.delete(props.equation.id);
        if (isDeleted) {
            setEquations([...equations.filter(equation => equation.id != props.equation.id)]);
        } else {
            alert("Failed to delete equation");
        }
    }

    async function showRootInput() {
        setRootInputFieldVisible(true);
    }

    async function tryAddRoot(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const root = event.currentTarget.root.value;
        const isValid = await equationFetcher.tryAddSolution(props.equation.id, root);
        if (isValid) {
            props.equation.solutions.push(root);
            setRootInputFieldVisible(false);
        } else {
            alert("Invalid root");
        }
    }

    function closeRootInput(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        setRootInputFieldVisible(false);
    }

    return (
        <div className="h-24 w-5/6 flex flex-col justify-center items-center gap-2
        bg-green-300 shadow-2xl rounded-xl">
            <div className="flex w-full justify-center px-5">
                <h1 className="w-full text-center text-xl font-serif font-bold">{props.equation.equationString}</h1>
                <button onClick={deleteEquation} className="justify-self-end">
                    <Delete className="rounded-xl"
                            sx={{
                                '&:hover': {color: '#e80000'}
                            }}/>
                </button>
            </div>
            <div className="flex items-center justify-center">
                <h2>Known solutions:&nbsp;</h2>
                <li className="list-none flex items-center justify-center">
                    {props.equation.solutions.map((root, id) => (
                        <ul key={id}>{root}{id != props.equation.solutions.length - 1 && ","}&nbsp;</ul>
                    ))}
                    {
                        !isRootInputFieldVisible ?
                            <button onClick={showRootInput}>
                                <Add className="bg-white rounded-xl"/>
                            </button> :
                            <form onSubmit={tryAddRoot} className="flex gap-2 items-center">
                                <input type="number" name="root" inputMode="numeric" className="bg-white rounded-xl
                            pl-0.5 md:pl-2 py-0" step={0.000001}/>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    className="w-4 h-3/5">
                                    Add
                                </Button>
                                <button onClick={closeRootInput}>
                                    <Close className="bg-white rounded-xl"/>
                                </button>
                            </form>
                    }
                </li>
            </div>
        </div>
    )
}

function Equations() {
    const {equations} = React.useContext(EquationsContext);
    const {filters} = React.useContext(FiltersContext);
    return (
        <div className="w-full flex flex-col items-center gap-5">
            <AddEquationCard/>
            {equations?.filter((equation) => {
                let isValid = true;
                console.log(equation);
                if (filters.has("search")) {
                    isValid = equation.equationString.startsWith(filters.get("search") as string);
                }
                if (filters.has("solutions")) {
                    isValid = isValid &&
                        (filters.get("solutions") as string[]).length == 0
                        || equation.solutions.find((solution) =>
                        (filters.get("solutions") as string[]).includes(solution.toString())) != undefined;
                }
                if (filters.has("solutionsCount")) {
                    const min = parseInt((filters.get("solutionsCount") as string[])[0]);
                    const max = parseInt((filters.get("solutionsCount") as string[])[1]);
                    console.log(min);
                    console.log(max);
                    isValid = isValid && equation.solutions.length >= min && equation.solutions.length <= max;
                }
                return isValid;
            }).map(equation => (
                <EquationCard key={equation.id} equation={equation}/>
            ))}
        </div>
    )
}

function EquationsPage() {
    const [filters, setFilters]
        = React.useState<Map<string, string | string[]>>(new Map<string, string | string[]>());
    const [equations, setEquations] =
        React.useState<Equation[]>([]);
    useEffect(() => {
        equationFetcher.getAll().then(equations => {
            setEquations(equations);
        });
    }, []);


    return (
        <>
            <Header/>
            <div className="w-screen flex overflow-x-hidden">
                <EquationsContext.Provider value={{equations, setEquations}}>
                    <FiltersContext.Provider value={{filters, setFilters}}>
                        <Filters/>
                        <div className="w-4/5 max-w-5/6 flex justify-center mb-8">
                            <Equations/>
                        </div>
                    </FiltersContext.Provider>
                </EquationsContext.Provider>
            </div>
        </>
    );
}

export default EquationsPage;