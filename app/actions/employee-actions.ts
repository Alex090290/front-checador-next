"use server";

import { ActionResponse, Employee } from "@/lib/definitions";
import { PhoneNumberFormat, sanitizePhoneNumber } from "@/lib/sinitizePhone";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { TInputsEmployee } from "../(auth)/app/employee/definition";
import { storeAction } from "./storeActions";

type FetchVacationsArgs = {
  page?: number;
  limit?: number;
  status?: string;
  leader?: number;
  personDoh?: number;
  employee?: number;
};

export async function fetchEmployees(args: FetchVacationsArgs = {}): Promise<{
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  }> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const pageNum = Math.max(Number(args.page ?? 1) || 1, 1);
    const limitNum = Math.min(Math.max(Number(args.limit ?? 20) || 20, 1), 100);

    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", String(limitNum));

    const response = await axios.get(`${API_URL}/employee/listall?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

  
      const total = Number(response.total ?? 0);
      const pages = Math.max(Math.ceil(total / limitNum), 1);
  
      return {
        data: response.data ?? [],
        total,
        page: pageNum,
        limit: limitNum,
        pages,
      };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return { data: [], total: 0, page: 1, limit: 20, pages: 1 };
  }
}

export async function findEmployeeById({
  id,
  _id,
}: {
  id?: number | null;
  _id?: string;
}): Promise<Employee | null> {
  try {
    const { apiToken, API_URL } = await storeAction();

    let params = {};

    if (_id) params = { idMongo: String(_id) };
    if (id) params = { id: Number(id) };

    const response = await axios
      .get(`${API_URL}/employee/listone`, {
        params,
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    return response.data || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

export async function createEmployee({
  data,
}: {
  data: TInputsEmployee;
}): Promise<ActionResponse<Employee | null>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    const sanitizedPhone = sanitizePhoneNumber(
      data.phonePersonal as unknown as string
    );

    /* const sanitizedPhonePersonal = sanitizePhoneNumber(
      data.phonePersonal as unknown as string
    ); */

    const sanitizedPhoneCompany = data.phoneCompany
      ? sanitizePhoneNumber(data.phoneCompany)
      : ({
          countryCode: "MX",
          dialCode: "",
          e164Number: "",
          internationalNumber: "",
          nationalNumber: "",
          number: "",
        } as PhoneNumberFormat);

    const sanitizedEmergencyContacts = data?.emergencyContacts.map(
      (contact) => {
        return {
          ...contact,
          phone: sanitizePhoneNumber(
            contact.phone.internationalNumber as unknown as string
          ),
        };
      }
    );

    const sanitizedHomePhone = data.homePhone
      ? sanitizePhoneNumber(data.homePhone)
      : null;

    await axios
      .post(
        `${API_URL}/employee`,
        {
          name: data.name,
          lastName: data.lastName,
          phonePersonal: sanitizedPhone,
          emailPersonal: data.emailPersonal,
          idCheck: data.idCheck,
          passwordCheck: data.passwordCheck,
          entryOffice: data.entryOffice,
          exitOffice: data.exitOffice,
          entryLunch: data.entryLunch,
          exitLunch: data.exitLunch,
          entrySaturdayOffice: data.entrySaturdayOffice,
          exitSaturdayOffice: data.exitSaturdayOffice,
          idDepartment: data.idDepartment?.id || 0,
          idPosition: data.idPosition,
          branch: data.branch,
          gender: data.gender,
          emergencyContacts: sanitizedEmergencyContacts,
          phoneCompany: sanitizedPhoneCompany,
          homePhone: sanitizedHomePhone,
          phoneExtCompany: !isNaN(data.phoneExtCompany)
            ? data.phoneExtCompany
            : 0,
          address: data.address,
          emailCompany: data.emailCompany || "",
          scheduleDescription: data.scheduleDescription,
          policies: data.policies,
          group: data.group,
          sons: data.sons,
          daughters: data.daughters,
          birthDate: data.birthDate,
          socialSecurityNumber: data.socialSecurityNumber,
          rfc: data.rfc,
          curp: data.curp,
          weight: Number(data.weight) || 0,
          height: Number(data.height) || 0,
          bloodType: data.bloodType.toUpperCase(),
          constitution: data.constitution,
          healthStatus: data.healthStatus,
          education: data.education,
          skills: data.skills,
          comments: data.comments,
          keyAspelNOI: data.keyAspelNOI,
          keyCONTPAQi: data.keyCONTPAQi,
          admissionDate: data.admissionDate,
          dischargeDate: data.dischargeDate,
          anniversaryLetter: data.anniversaryLetter,
          nationality: data.nationality,
          dailyWage: Number(data.dailyWage),
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    /* if (response.data.status === 400) {
      const errs = response.data.errors
        .map((err: { message: string }) => err.message)
        .join("\n");

      throw new Error(`${errs}`);
    } */

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado creado",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateEmploye({
  data,
  id,
}: {
  data: TInputsEmployee;
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    const { apiToken, API_URL } = await storeAction();

    if (!id) {
      throw new Error("No se ha definido ID");
    }
    
    const sanitizedPhonePersonal = sanitizePhoneNumber(
      data.phonePersonal as unknown as string
    );

    const sanitizedPhoneCompany = data.phoneCompany
      ? sanitizePhoneNumber(data.phoneCompany)
      : ({
          countryCode: "MX",
          dialCode: "",
          e164Number: "",
          internationalNumber: "",
          nationalNumber: "",
          number: "",
        } as PhoneNumberFormat);

    const sanitizedEmergencyContacts = data?.emergencyContacts.map(
      (contact) => {
        return {
          ...contact,
          phone: sanitizePhoneNumber(
            contact.phone.internationalNumber as unknown as string
          ),
        };
      }
    );

    const sanitizedHomePhone = data.homePhone
      ? sanitizePhoneNumber(data.homePhone)
      : null;

    await axios
      .put(
        `${API_URL}/employee/${String(id)}`,
        {
          name: data.name,
          lastName: data.lastName,
          phonePersonal: sanitizedPhonePersonal,
          emailPersonal: data.emailPersonal,
          idCheck: data.idCheck,
          passwordCheck: data.passwordCheck,
          entryOffice: data.entryOffice,
          exitOffice: data.exitOffice,
          entryLunch: data.entryLunch,
          exitLunch: data.exitLunch,
          entrySaturdayOffice: data.entrySaturdayOffice,
          exitSaturdayOffice: data.exitSaturdayOffice,
          idDepartment: data.idDepartment?.id || 0,
          idPosition: data.idPosition,
          branch: data.branch,
          gender: data.gender,
          status: data.status,
          emergencyContacts: sanitizedEmergencyContacts,
          phoneCompany: sanitizedPhoneCompany,
          homePhone: sanitizedHomePhone,
          phoneExtCompany: !isNaN(data.phoneExtCompany)
            ? data.phoneExtCompany
            : 0,
          address: data.address,
          emailCompany: data.emailCompany || "",
          scheduleDescription: data.scheduleDescription,
          policies: data.policies,
          group: data.group,
          sons: data.sons,
          daughters: data.daughters,
          birthDate: data.birthDate,
          nationality: data.nationality,
          socialSecurityNumber: data.socialSecurityNumber,
          rfc: data.rfc,
          curp: data.curp,
          weight: Number(data.weight) || 0,
          height: Number(data.height) || 0,
          bloodType: data.bloodType,
          constitution: data.constitution,
          healthStatus: data.healthStatus,
          education: data.education,
          skills: data.skills,
          comments: data.comments,
          keyAspelNOI: data.keyAspelNOI,
          keyCONTPAQi: data.keyCONTPAQi,
          admissionDate: data.admissionDate,
          dischargeDate: data.dischargeDate,
          anniversaryLetter: data.anniversaryLetter,
          dischargeReason: data.dischargeReason,
          typeOfDischarge: data.typeOfDischarge,
          role: data.role,
          visibleRecords: true,
          dailyWage: Number(data.dailyWage),
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    /* if (response.data.status === 400) {
      const errs = response.data.errors
        .map((err: { message: string }) => err.message)
        .join("\n");

      console.log(errs);
      throw new Error(`${errs}`);
    } */

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado actualizado",
      data: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
      data: false,
    };
  }
}

export async function deleteEmployee({
  id,
}: {
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    if (!id) throw Error("ID NO ESPECIFICADO");

    const { apiToken, API_URL } = await storeAction();

    await axios
      .delete(`${API_URL}/employee/${String(id)}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(
          err.response.data.message
            ? err.response.data.message
            : "Error en la respuesta"
        );
      });

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado eliminado",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function reEntry({
  id,
}: {
  id: number | null;
}): Promise<ActionResponse<boolean>> {
  try {
    if (!id) throw new Error("ID NO ESPECIFICADO");

    const { apiToken, API_URL } = await storeAction();

    await axios.put(
      `${API_URL}/employee/reEntry/${String(id)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    revalidatePath("/app/employee");

    return {
      success: true,
      message: "Empleado reingresado",
    };
  } catch (error: any) {
    console.log(error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Error en la respuesta",
    };
  }
}