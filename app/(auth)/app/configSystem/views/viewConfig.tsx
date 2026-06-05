import { getConfigSystem } from "@/app/actions/configSystem-actions";
import ConfigSystem from "@/components/configSystem/configPrincipalView";

export default async function viewConfig(){
    const [] = await Promise.all([
        getConfigSystem
    ]);

    return(
        <ConfigSystem />
    )
}