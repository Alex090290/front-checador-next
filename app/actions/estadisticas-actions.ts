"use server"

import { storeAction } from "./storeActions";
import axios from "axios";
import { IStatistics } from "@/lib/statistics/interface";

export async function showStatistics(year: string, idPeriod: string): Promise<{ data: IStatistics }> {
    const dataDefault = {
        data: {
            year: {
                permissions: 0,
                vacations: 0,
                disabilities: 0,
                overtimes: 0,
                penalties: 0,
                excusedAbsences: 0,
                unexcusedAbsences: 0,
            },
            period: {
                permissions: 0,
                vacations: 0,
                disabilities: 0,
                overtimes: 0,
                penalties: 0,
                excusedAbsences: 0,
                unexcusedAbsences: 0,
            }
        }
    };

    try {

        const { apiToken, API_URL } = await storeAction();
        const res = await axios.get(
            `${API_URL}/statistics/${year}/${idPeriod}`,
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        return {
            data: res.data?.data ?? dataDefault
        };
    } catch (error: unknown) {
        console.log(error);
        return dataDefault
    }

}