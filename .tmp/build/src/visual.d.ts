import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import DataViewMatrixNode = powerbi.DataViewMatrixNode;
import DataViewHierarchyLevel = powerbi.DataViewHierarchyLevel;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
export declare class Visual implements IVisual {
    private target;
    private updateCount;
    private settings;
    private textNode;
    private datachina;
    private datacity;
    private maxLocal;
    private host;
    private selectionManager;
    constructor(options: VisualConstructorOptions);
    groupByA(total: any, currentValue: any, currentIndex: any): any;
    ee(data: any[], t: {}, l: DataViewHierarchyLevel[], r: DataViewMatrixNode[], v: DataViewMetadataColumn[]): void;
    update(options: VisualUpdateOptions): void;
    randomData(): number;
    private static parseSettings;
    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject;
}
