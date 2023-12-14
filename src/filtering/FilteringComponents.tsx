import {Chip, Slider, TextField} from "@mui/material";
import React, {ChangeEvent, Context, Dispatch, useContext} from "react";
import {Add, Search} from "@mui/icons-material";

export function SearchFilter(props: {
    filterContext: Context<{
        filters: Map<string, string | string[]>,
        setFilters: Dispatch<React.SetStateAction<Map<string, string | string[]>>>
    }>
}) {

    const {filters, setFilters} = useContext(props.filterContext);

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        setFilters(new Map(filters.set("search", event.currentTarget.value)));
    }

    return (
        <div>
            <TextField
                onChange={onChange}
                id="outlined-basic"
                label="Search"
                variant="outlined"
                InputProps={
                    {
                        endAdornment: <Search/>
                    }
                }
            />
        </div>
    )
}

export function RangeFilter(props: {
    label: string,
    step: number,
    min: number,
    max: number,
    rangeName: string,
    filterContext: Context<{
        filters: Map<string, string | string[]>,
        setFilters: Dispatch<React.SetStateAction<Map<string, string | string[]>>>
    }>
}) {
    const {filters, setFilters} = useContext(props.filterContext);

    function onChange(event: Event, value: number | number[]) {
        event.preventDefault();
        setFilters(new Map(filters.set(props.rangeName,
            (value as number[]).map((v) => v.toString()))));
    }

    function changeMin(event: ChangeEvent<HTMLInputElement>) {
        onChange(event as unknown as Event, [parseInt(event.currentTarget.value),
            parseInt((filters.get(props.rangeName) as string[])![1])]);
    }

    function changeMax(event: ChangeEvent<HTMLInputElement>) {
        onChange(event as unknown as Event, [parseInt((filters.get(props.rangeName) as string[])![0]),
            parseInt(event.currentTarget.value)]);
    }

    if (!filters.has(props.rangeName)) {
        setFilters(new Map(filters.set(props.rangeName, [props.min.toString(), props.max.toString()])));
    }

    return (
        <div className="w-5/6">
            <p>{props.label}</p>
            <div className="flex justify-between items-center gap-2 mt-4">
                <TextField
                    onChange={changeMin}
                    size="small"
                    value={parseInt((filters.get(props.rangeName) as string[])![0])}
                    InputProps={
                        {
                            inputProps: {
                                min: props.min,
                                max: parseInt((filters.get(props.rangeName) as string[])![1])
                            }
                        }
                    }
                    type="number"/>
                <p>-</p>
                <TextField
                    onChange={changeMax}
                    size="small"
                    value={parseInt((filters.get(props.rangeName) as string[])![1])}
                    InputProps={
                        {
                            inputProps: {
                                min: parseInt((filters.get(props.rangeName) as string[])![0]),
                                max: props.max
                            }
                        }
                    }
                    type="number"/>
            </div>
            <Slider
                getAriaLabel={() => props.label}
                onChange={onChange}
                step={props.step}
                marks
                min={props.min}
                max={props.max}
                slotProps={{
                    thumb: {
                        style: {
                            width: 10,
                            height: 10,
                        }
                    },
                }}
                valueLabelDisplay="auto"
                value={(filters.get(props.rangeName) as string[]).map(val => parseInt(val))}/>
        </div>
    )
}

export function TraitFilter(props: {
    filterContext: Context<{
        filters: Map<string, string | string[]>,
        setFilters: Dispatch<React.SetStateAction<Map<string, string | string[]>>>
    }>,
    trait: string,
    label: string
}) {
    const {filters, setFilters} = useContext(props.filterContext);
    const [isInputActive, setIsInputActive] = React.useState<boolean>(false);

    function showInput() {
        setIsInputActive(true);
    }

    function addTraitValue(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const traitValues = filters.get(props.trait) as string[];
        const traitValue = event.currentTarget.root.value;
        setFilters(new Map(filters.set(props.trait, [...traitValues, traitValue])));
        setIsInputActive(false);
    }

    if (!filters.has(props.trait)) {
        setFilters(new Map(filters.set(props.trait, [])));
    }

    return (
        <div className="w-5/6 max-w-5/6">
            <p>{props.label}</p>
            <div className="flex gap-2 mt-4 h-fit flex-wrap">
                {(filters.get(props.trait) as string[]).map((value) =>
                    <TraitValueFilter
                        filterContext={props.filterContext}
                        trait={props.trait}
                        value={value}/>
                )}
                {isInputActive ?
                    <form onSubmit={addTraitValue} className="flex items-center gap-2">
                        <input type="number" inputMode="numeric" name="root" autoFocus={true} step={0.000000000001}
                               max="999999999999999999999" className="w-16 bg-gray-300 rounded-3xl pl-1.5"/>
                        <button type="submit">
                            <Add className="rounded-3xl bg-gray-300"/>
                        </button>
                    </form>
                    :
                    <button onClick={showInput}>
                        <Add className="rounded-3xl bg-gray-300"/>
                    </button>
                }
            </div>
        </div>
    )
}

export function TraitValueFilter(props: {
    filterContext: Context<{
        filters: Map<string, string | string[]>,
        setFilters: Dispatch<React.SetStateAction<Map<string, string | string[]>>>
    }>,
    trait: string,
    value: string,
}) {
    const {filters, setFilters}
        = useContext(props.filterContext);

    function removeFromTraits(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const traitValues = filters.get(props.trait) as string[];
        setFilters(new Map(filters.set(props.trait,
            traitValues.filter((v) => v !== props.value))));
    }

    return (
        <div className="min-w-12 max-w-2xl">
            <Chip
                label={props.value}
                onDelete={removeFromTraits}
                color="primary"
                variant="outlined"/>
        </div>
    )
}