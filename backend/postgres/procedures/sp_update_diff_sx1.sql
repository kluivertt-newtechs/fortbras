create or replace procedure public.sp_update_diff_sx1(p_uuid varchar, p_tabela varchar)
language plpgsql
as $$
declare
       v_query_select_dict_1 varchar;
       v_query_diff varchar;
       reg record;
       reg_diff record;
       diff_count int := 0;
      _rows int := 0;

begin

    -- Marca registros que existe no dicionário 1, mas não existem no dicionário 2
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 2 and	
								s2.x1_grupo = s.x1_grupo and 
								s2.x1_ordem = s.x1_ordem and 
								s2.x1_pergunt = s.x1_pergunt and
								s2.x1_idfil = s.x1_idfil and
								s2.x1_help = s.x1_help
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 1 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existe no dicionário 2, mas não existem no dicionário 1
	v_query_select_dict_1 := 'select s.* from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
                            (
								s2.uuid = s.uuid and 
								s2.dict = 1 and	
								s2.x1_grupo = s.x1_grupo and 
								s2.x1_ordem = s.x1_ordem and 
								s2.x1_pergunt = s.x1_pergunt and
								s2.x1_idfil = s.x1_idfil and
								s2.x1_help = s.x1_help
                            ) where s.uuid = ''' || p_uuid || ''' and 
								s.dict = 2 and 
								s2.id is null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		v_query_diff := 'update ' || p_tabela || ' set diff = ' || diff_count || ' where id = ' || reg.id || '';
        execute v_query_diff;
		
	end loop;

	-- Marca registros que existem dos dois dicionários, mas possuem diferenças
	v_query_select_dict_1 := 'select s.id, s2.id as id_diff from ' || p_tabela || ' s left join ' || p_tabela || ' s2 on 
							(
								s2.x1_grupo = s.x1_grupo and 
								s2.x1_ordem = s.x1_ordem and 
								s2.x1_pergunt = s.x1_pergunt and
								s2.x1_idfil = s.x1_idfil and
								s2.x1_help = s.x1_help and
								(
                                    s.x1_perspa  <> s2.x1_perspa  or
                                    s.x1_pereng  <> s2.x1_pereng  or
                                    s.x1_variavl <> s2.x1_variavl or
                                    s.x1_tipo    <> s2.x1_tipo    or
                                    s.x1_tamanho <> s2.x1_tamanho or
                                    s.x1_decimal <> s2.x1_decimal or
                                    s.x1_presel  <> s2.x1_presel  or
                                    s.x1_gsc     <> s2.x1_gsc     or
                                    s.x1_valid   <> s2.x1_valid   or
                                    s.x1_var01   <> s2.x1_var01   or
                                    s.x1_def01   <> s2.x1_def01   or
                                    s.x1_defspa1 <> s2.x1_defspa1 or
                                    s.x1_defeng1 <> s2.x1_defeng1 or
                                    s.x1_cnt01   <> s2.x1_cnt01   or
                                    s.x1_var02   <> s2.x1_var02   or
                                    s.x1_def02   <> s2.x1_def02   or
                                    s.x1_defspa2 <> s2.x1_defspa2 or
                                    s.x1_defeng2 <> s2.x1_defeng2 or
                                    s.x1_cnt02   <> s2.x1_cnt02   or
                                    s.x1_var03   <> s2.x1_var03   or
                                    s.x1_def03   <> s2.x1_def03   or
                                    s.x1_defspa3 <> s2.x1_defspa3 or
                                    s.x1_defeng3 <> s2.x1_defeng3 or
                                    s.x1_cnt03   <> s2.x1_cnt03   or
                                    s.x1_var04   <> s2.x1_var04   or
                                    s.x1_def04   <> s2.x1_def04   or
                                    s.x1_defspa4 <> s2.x1_defspa4 or
                                    s.x1_defeng4 <> s2.x1_defeng4 or
                                    s.x1_cnt04   <> s2.x1_cnt04   or
                                    s.x1_var05   <> s2.x1_var05   or
                                    s.x1_def05   <> s2.x1_def05   or
                                    s.x1_defspa5 <> s2.x1_defspa5 or
                                    s.x1_defeng5 <> s2.x1_defeng5 or
                                    s.x1_cnt05   <> s2.x1_cnt05   or
                                    s.x1_f3      <> s2.x1_f3      or
                                    s.x1_pyme    <> s2.x1_pyme    or
                                    s.x1_grpsxg  <> s2.x1_grpsxg  or
                                    s.x1_picture <> s2.x1_picture
								)
							)
							where s.uuid = ''' || p_uuid || ''' and s.dict = 1 and s2.id is not null';
    for reg in execute v_query_select_dict_1
	loop
  
		diff_count := diff_count + 1;
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id, diff_count;	                	
		execute 'update ' || p_tabela || ' set diff = $2 where id in ($1)' using reg.id_diff, diff_count;
		
	end loop;
end 
$$;
