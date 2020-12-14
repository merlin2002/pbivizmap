import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    myproperties: myPropertiesSettings;
}
export declare class myPropertiesSettings {
    defaultColor: string;
    showAllDataPoints: boolean;
    fill: string;
    fillRule: string;
    fontSize: number;
    theme: string;
    showtoolbox: boolean;
    showlegend: boolean;
    renderer: string;
    showlable: boolean;
    lableposition: string;
    getthemecolor(themename: string): string;
}
