/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
import * as echarts from 'echarts';

import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewTable = powerbi.DataViewTable;
import DataViewTableRow = powerbi.DataViewTableRow;
import DataViewMatrix = powerbi.DataViewMatrix;
import DataViewMatrixNode = powerbi.DataViewMatrixNode;
import DataViewHierarchyLevel = powerbi.DataViewHierarchyLevel
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import DataViewValueColumns = powerbi.DataViewValueColumns;
import DataViewValueColumn = powerbi.DataViewValueColumn;

import { timeHours } from "d3";
import { readyException } from "jquery";


export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private datachina: any;
    private datacity: any;
    private maxLocal:any;

    private host: IVisualHost; // <== NEW PROPERTY
    private selectionManager: ISelectionManager; // <== NEW PROPERTY

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        // create selection manager
        this.selectionManager = this.host.createSelectionManager();

        // this.maplevel = { name: '全国', value: null, key: null }
    }

    // public groupBy<T extends Record<K, PropertyKey>, K extends keyof T>(
    //     items: readonly T[],
    //     key: K
    //   ) {
    //     return items.reduce((acc, item) => {
    //         let a={}
    //         if (acc[item[key]] || [])
    //         {
    //             acc[item[key]] = acc[item[key]];
    //             acc[item[key]].push(a);
    //         }
    //         acc[item[key]]["value"]+=item["含税销售额"];
    //       return acc;
    //     }, {} as Record<T[K], T[]>);
    //   }

    public groupByA(total, currentValue, currentIndex) {
        return total + currentValue[currentIndex];
    }

    public ee(data: any[], t: {}, l: DataViewHierarchyLevel[], r: DataViewMatrixNode[], v: DataViewMetadataColumn[]) {
        r.map((r1: DataViewMatrixNode) => {
            t[l[r1.level].sources[0].displayName] = r1.value
            if (r1.children) {
                this.ee(data, t, l, r1.children, v)
            }
            if (r1.values) {
                v.map((r3, index) => {
                    t[r3.displayName] = r1.values[index].value
                    data.push(JSON.parse(JSON.stringify(t)));
                })
            }
        })
    }

    public update(options: VisualUpdateOptions) {
        debugger;
        const dataView: DataView = options.dataViews[0];
        const categoricalDataView: DataViewCategorical = dataView.categorical;
        const dataViewTable: DataViewTable = dataView.table;
        const dataViewMatrix: DataViewMatrix = dataView.matrix;
        // const singleDataView: DataViewSingle = dataView.single;
        // const dataViewcategorical:DataViewCategorical=dataView.categorical;

        // debugger;
        if (!categoricalDataView ||
            !categoricalDataView.categories ||
            !categoricalDataView.categories[0] ||
            !categoricalDataView.values
        ) {
            return;
        }

        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.target.innerHTML = `<div id='echarts' class='echarts' name='echarts' style='width: 100%;height: 100%;text-align: center;'></div>`;

        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        const categoryFieldIndex = 0;
        const measureFieldIndex = 0;
        // let categories: PrimitiveValue[] = categoricalDataView.categories[categoryFieldIndex].values;
        // let values: DataViewValueColumnGroup[] = categoricalDataView.values.grouped();

        let data = [];
        let selectionID: ISelectionId[] = [];

        let values: DataViewValueColumns = categoricalDataView.values;

        this.maxLocal=values[0].maxLocal;

        values[measureFieldIndex].values.map((years: PrimitiveValue, index) => {
            if (categoricalDataView.categories[categoricalDataView.categories.length - 1].values[index]) {
                data.push(
                    {
                        name: categoricalDataView.categories[categoricalDataView.categories.length - 1].values[index],
                        value: years
                    }
                )
            }
        });

        categoricalDataView.categories[categoricalDataView.categories.length - 1].values.forEach((category: powerbi.PrimitiveValue, index: number) => {
            selectionID.push(this.host.createSelectionIdBuilder()
                .withCategory(categoricalDataView.categories[0], index)
                .createSelectionId()
            )
        })
        let cityname: any;

        if (categoricalDataView.categories[categoricalDataView.categories.length - 2]) {
            cityname = categoricalDataView.categories[categoricalDataView.categories.length - 2].values[0]
        }
        else {
            cityname = '全国';
        }

        console.log(data);

        //绘制图表
        const ec = echarts as any;

        let colorname = this.settings.myproperties.theme;
        if (colorname != "default") {
            echarts.registerTheme(colorname, JSON.parse(this.settings.myproperties.getthemecolor(colorname)))
        }

        var myChart = ec.init(document.getElementById('echarts'), colorname, { renderer: this.settings.myproperties.renderer });
        let selectionManager = this.selectionManager;

        let p = new Promise((resolve, reject) => {
            if (cityname == "全国") {
                resolve("https://geo.datav.aliyun.com/areas_v2/bound/100000_full.json");
            }
            else {
                $.getJSON(`https://restapi.amap.com/v3/config/district?keywords=${cityname}&subdistrict=2&key=27225883d84490ce704f2a452f38daa3`, function (geoJson) {
                    if ((data.length == 1) && (data[0].name==cityname)) {
                        resolve(`https://geo.datav.aliyun.com/areas/bound/geojson?code=${geoJson.districts[0].adcode}`);
                    }
                    else {
                        resolve(`https://geo.datav.aliyun.com/areas/bound/geojson?code=${geoJson.districts[0].adcode}_full`);
                    }
                })
            }
            // reject(e.message);
        });

        p.then((res: any) => {

            myChart.showLoading();
            let maxLocal=this.maxLocal;
            $.getJSON(res, function (geoJson) {
                myChart.hideLoading();
                echarts.registerMap('地图', geoJson);
                myChart.setOption({
                    tooltip: {
                        trigger: 'item',
                        // position: [80, 80]
                    },
                    title: {
                        text: cityname,
                        // subtext: '数据来自Echarts',
                        left: 'center',
                        top: "20"
                    },
                    toolbox: {
                        show: false,
                        orient: 'vertical',
                        left: 'right',
                        top: 'center',
                        feature: {
                            dataView: { readOnly: false },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    visualMap: {
                        min: 0,
                        max: maxLocal,
                        text: ['High', 'Low'],
                        realtime: false,
                        calculable: true,
                        inRange: {
                            color: ['#e0ffff', '#006edd']
                        }
                    },
                    geo: {
                        map: '地图',
                        roam: false,
                        zoom: 1.23,
                        label: {
                            normal: {
                                show: true,
                                fontSize: '10',
                                color: 'rgba(0,0,0,0.7)'
                            }
                        },
                        scaleLimit: {
                            min: 1,
                            max: 10
                        },
                        itemStyle: {
                            normal: {
                                borderColor: 'rgba(0, 0, 0, 0.2)'
                            },
                            emphasis: {
                                areaColor: '#F3B329',
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                                shadowBlur: 20,
                                borderWidth: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    },
                    series: [
                        {
                            name: cityname,
                            type: 'map',
                            // mapType: '重庆', // 自定义扩展图表类型
                            geoIndex: 0,
                            data: data
                            // 自定义名称映射

                        }
                    ]
                });


                myChart.on('click', function (params) {
                    selectionManager.select(selectionID[params.dataIndex]);
                });


                myChart.on('contextmenu', function (params) {

                    selectionManager.showContextMenu(selectionID[params.dataIndex], {
                        x: params.event.event.clientX,
                        y: params.event.event.clientY
                    })
                    params.event.event.preventDefault();
                });

            });

        });
    }

    randomData() {
        return Math.round(Math.random() * 1000);
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}