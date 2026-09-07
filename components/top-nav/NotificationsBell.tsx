import { ListNotifications, ReadNotifications } from "@/app/actions/notifies-actions";
import { INotifications } from "@/lib/notis/interface";
import { Dropdown } from "react-bootstrap";
import useSWR from "swr";

function NotificationsBell() {
    const { data, mutate, isLoading } = useSWR<INotifications[]>(
        "notifications",
        ListNotifications,
        { refreshInterval: 30000 }
    );

    const notifications = data ?? [];
    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleClickNotification = async (n: INotifications) => {
        if (!n.read) {
            await ReadNotifications({ idNotifie: String(n._id) });
            mutate();
        }
    };

    console.log("NOTIFICACIONES:", notifications);


    return (
        <>
            <div className="position-relative">
                <i className="bi bi-bell fs-5"></i>
                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.65rem" }}
                    >
                        {unreadCount}
                        <span className="visually-hidden">notificaciones no leídas</span>
                    </span>
                )}
            </div>

            
        </>
    )
}

export default NotificationsBell;