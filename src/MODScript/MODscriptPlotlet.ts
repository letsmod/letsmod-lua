import { MODscriptEvent } from './MODscriptEvent';

export class MODscriptPlotlet {
    
    public get IsFinished(): boolean{return false;}
    public get IsActive():boolean {return false;}

    public id = 0;
    public plotletType = "";
    public enabled:boolean = true;
    events: MODscriptEvent[] = [];
    

    constructor(id:number, plotletDef: PlotletDefinition) {
        this.id = id;
        
        
    }

    enablePlotlet() {
        throw new Error("Method not implemented.");
    }
    disablePlotlet() {
        throw new Error("Method not implemented.");
    }
    
}