import Apresentacao from "../components/Apresentacao";
import NavbarSite from "../components/NavbarSite";
import Problema from "../components/Problema";
import QuemSomos from "../components/QuemSomos";

export default function Home() {
    return (
    <>
        <NavbarSite />
        <main>
        <Apresentacao />
        <QuemSomos />
        <Problema />
        </main>
    </>
    );
}