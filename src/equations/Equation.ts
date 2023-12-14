import consts from "../consts.ts";

class Equation {
    public id: number;
    public equationString: string;
    public solutions: number[];
    public polynomial: Polynomial;

    constructor(id: number, equation: string, solutions: number[], polynomial: Polynomial) {
        this.id = id;
        this.equationString = equation;
        this.solutions = solutions;
        this.polynomial = polynomial;
    }
}

class EquationFetcher {
    public async getById(id: number) {
        return this.getByUri(consts.API_URL + 'equations/' + id);
    }

    public async getByUri(uri: string): Promise<Equation> {
        const responseBody = await fetch(
            uri, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': consts.API_URL
                }
            })
            .then(response => {
                return response.json();
            });
        return responseBody;
    }

    public async getAll(page = 0,
                        sortBy = "id",
                        pageSize = Number.MAX_VALUE,
                        desc = false): Promise<Equation[]> {
        const responseBody = await fetch(
            consts.API_URL + 'equations?page=' + page +
            '&sortBy=' + sortBy + '&pageSize=' + pageSize + (desc && '&desc'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': consts.API_URL
                }
            })
            .then(response => {
                return response.json();
            });
        return responseBody;
    }

    public async create(equation: CreateEquationDto) {
        const result = await fetch(consts.API_URL + 'equations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': consts.API_URL,
                'Access-Control-Allow-Headers': 'Location'
            },
            body: JSON.stringify(equation)
        });
        console.log(result);
        return {
            isOk: result.ok,
            location: result.headers.get('Location'),
            message: await result.text()
        };
    }

    public async delete(id: number) {
        const result = await fetch(consts.API_URL + 'equations/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': consts.API_URL
            }
        });
        return {
            isOk: result.ok,
            message: await result.text()
        };
    }

    public async tryAddSolution(id: number, solution: number): Promise<boolean> {
        const response = await fetch(consts.API_URL + 'equations/' + id + '/solutions?x='+solution, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': consts.API_URL
            },
        });
        return response.ok;
    }
}

export const equationFetcher = new EquationFetcher();

export class CreateEquationDto {
    public equation: string;

    constructor(equation: string) {
        this.equation = equation;
    }

}

class Polynomial {
    private _numeratorCoefficients: Map<number, number>;
    private _denominatorCoefficients: Map<number, number>;

    constructor(numeratorCoefficients: Map<number, number>, denominatorCoefficients: Map<number, number>) {
        this._numeratorCoefficients = numeratorCoefficients;
        this._denominatorCoefficients = denominatorCoefficients;
    }

    get numeratorCoefficients(): Map<number, number> {
        return this._numeratorCoefficients;
    }

    set numeratorCoefficients(value: Map<number, number>) {
        this._numeratorCoefficients = value;
    }

    get denominatorCoefficients(): Map<number, number> {
        return this._denominatorCoefficients;
    }

    set denominatorCoefficients(value: Map<number, number>) {
        this._denominatorCoefficients = value;
    }
}

export default Equation;